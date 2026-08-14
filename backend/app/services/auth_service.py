from app.core.local_auth import (
    LOCAL_AUTH_EXPIRES_SECONDS,
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import AuthResponse, LoginRequest, PasswordChangeRequest, SignupRequest


class AuthService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def signup(self, payload: SignupRequest) -> AuthResponse:
        existing = self.user_repository.get_by_email(payload.email)
        if existing is not None:
            raise ValueError("Email already exists")

        user = User(
            email=payload.email,
            full_name=payload.full_name,
            phone_number=payload.phone_number,
            is_active=True,
            is_buyer=payload.wants_to_buy,
            is_seller=payload.wants_to_sell,
            password_hash=hash_password(payload.password),
        )
        created = self.user_repository.create(user)

        token = create_access_token(user_id=str(created.id), email=created.email)
        return AuthResponse(
            user_id=created.id,
            is_buyer=created.is_buyer,
            is_seller=created.is_seller,
            access_token=token,
            expires_in=LOCAL_AUTH_EXPIRES_SECONDS,
        )

    def login(self, payload: LoginRequest) -> AuthResponse:
        user = self.user_repository.get_by_email(payload.email)
        if user is None or not verify_password(payload.password, user.password_hash):
            raise PermissionError("Invalid email or password")
        if not user.is_active:
            raise PermissionError("Account is inactive")

        token = create_access_token(user_id=str(user.id), email=user.email)
        return AuthResponse(
            user_id=user.id,
            is_buyer=user.is_buyer,
            is_seller=user.is_seller,
            access_token=token,
            expires_in=LOCAL_AUTH_EXPIRES_SECONDS,
        )

    def change_password(self, user: User, payload: PasswordChangeRequest) -> None:
        if not verify_password(payload.current_password, user.password_hash):
            raise PermissionError("Current password is incorrect")
        user.password_hash = hash_password(payload.new_password)
        self.user_repository.save(user)
