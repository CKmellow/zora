from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_local_user_claims
from app.repositories.merchant_repository import MerchantRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    AuthMeResponse,
    AuthResponse,
    AuthUserProfile,
    LoginRequest,
    PasswordChangeRequest,
    ProfileUpdateRequest,
    SignupRequest,
)
from app.schemas.merchant import MerchantCreate
from app.services.auth_service import AuthService
from app.services.profile_service import ProfileService

router = APIRouter()


@router.get("/me")
async def me(
    claims: dict = Depends(get_current_local_user_claims),
    db: Session = Depends(get_db),
) -> AuthMeResponse:
    user_repository = UserRepository(db)
    service = ProfileService(user_repository=user_repository, merchant_repository=None)
    try:
        user = service.get_user_or_raise(UUID(claims["sub"]))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found") from exc

    return AuthMeResponse(
        user=AuthUserProfile(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            phone_number=user.phone_number,
            is_active=user.is_active,
            is_buyer=user.is_buyer,
            is_seller=user.is_seller,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )
    )


@router.post("/signup", response_model=AuthResponse)
async def signup(payload: SignupRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user_repository = UserRepository(db)
    auth_service = AuthService(user_repository=user_repository)
    try:
        response = auth_service.signup(payload)

        if payload.wants_to_sell and payload.store_name:
            profile_service = ProfileService(
                user_repository=user_repository,
                merchant_repository=MerchantRepository(db),
            )
            user = profile_service.get_user_or_raise(response.user_id)
            profile_service.create_merchant(
                user=user,
                payload=MerchantCreate(
                    name=payload.store_name,
                    email=payload.email,
                    phone_number=payload.phone_number,
                    till_number=payload.till_number,
                ),
            )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

    return response


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user_repository = UserRepository(db)
    auth_service = AuthService(user_repository=user_repository)
    try:
        return auth_service.login(payload)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc


@router.patch("/me", response_model=AuthMeResponse)
async def update_profile(
    payload: ProfileUpdateRequest,
    claims: dict = Depends(get_current_local_user_claims),
    db: Session = Depends(get_db),
) -> AuthMeResponse:
    user_repository = UserRepository(db)
    service = ProfileService(user_repository=user_repository, merchant_repository=None)
    try:
        user = service.get_user_or_raise(UUID(claims["sub"]))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found") from exc

    updated = service.update_profile(user, payload)
    return AuthMeResponse(
        user=AuthUserProfile(
            id=updated.id,
            email=updated.email,
            full_name=updated.full_name,
            phone_number=updated.phone_number,
            is_active=updated.is_active,
            is_buyer=updated.is_buyer,
            is_seller=updated.is_seller,
            created_at=updated.created_at,
            updated_at=updated.updated_at,
        )
    )


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    payload: PasswordChangeRequest,
    claims: dict = Depends(get_current_local_user_claims),
    db: Session = Depends(get_db),
) -> None:
    user_repository = UserRepository(db)
    auth_service = AuthService(user_repository=user_repository)
    profile_service = ProfileService(user_repository=user_repository, merchant_repository=None)

    try:
        user = profile_service.get_user_or_raise(UUID(claims["sub"]))
        auth_service.change_password(user, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found") from exc
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
