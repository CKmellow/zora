from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_local_user_claims
from app.repositories.merchant_repository import MerchantRepository
from app.repositories.user_repository import UserRepository
from app.schemas.merchant import MerchantCreate, MerchantRead, MerchantUpdate
from app.services.profile_service import ProfileService

router = APIRouter()


@router.get("/me", response_model=list[MerchantRead])
async def list_my_stores(
    claims: dict = Depends(get_current_local_user_claims),
    db: Session = Depends(get_db),
) -> list[MerchantRead]:
    user_repository = UserRepository(db)
    merchant_repository = MerchantRepository(db)
    service = ProfileService(
        user_repository=user_repository,
        merchant_repository=merchant_repository,
    )
    try:
        user = service.get_user_or_raise(UUID(claims["sub"]))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found") from exc

    merchants = service.list_my_merchants(user)
    return [MerchantRead.model_validate(merchant) for merchant in merchants]


@router.post("", response_model=MerchantRead, status_code=status.HTTP_201_CREATED)
async def create_store(
    payload: MerchantCreate,
    claims: dict = Depends(get_current_local_user_claims),
    db: Session = Depends(get_db),
) -> MerchantRead:
    user_repository = UserRepository(db)
    merchant_repository = MerchantRepository(db)
    service = ProfileService(
        user_repository=user_repository,
        merchant_repository=merchant_repository,
    )
    try:
        user = service.get_user_or_raise(UUID(claims["sub"]))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found") from exc

    merchant = service.create_merchant(user, payload)
    return MerchantRead.model_validate(merchant)


@router.patch("/{merchant_id}", response_model=MerchantRead)
async def update_store(
    merchant_id: UUID,
    payload: MerchantUpdate,
    claims: dict = Depends(get_current_local_user_claims),
    db: Session = Depends(get_db),
) -> MerchantRead:
    user_repository = UserRepository(db)
    merchant_repository = MerchantRepository(db)
    service = ProfileService(
        user_repository=user_repository,
        merchant_repository=merchant_repository,
    )
    try:
        user = service.get_user_or_raise(UUID(claims["sub"]))
        merchant = service.update_merchant(user=user, merchant_id=merchant_id, payload=payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc

    return MerchantRead.model_validate(merchant)
