from uuid import UUID

from app.models.merchant import Merchant
from app.models.user import User
from app.repositories.merchant_repository import MerchantRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import ProfileUpdateRequest
from app.schemas.merchant import MerchantCreate, MerchantUpdate


class ProfileService:
    def __init__(
        self,
        user_repository: UserRepository,
        merchant_repository: MerchantRepository | None,
    ):
        self.user_repository = user_repository
        self.merchant_repository = merchant_repository

    def _merchant_repository_or_raise(self) -> MerchantRepository:
        if self.merchant_repository is None:
            raise RuntimeError("Merchant repository is not configured")
        return self.merchant_repository

    def get_user_or_raise(self, user_id: UUID) -> User:
        user = self.user_repository.get_by_id(str(user_id))
        if user is None:
            raise ValueError("User not found")
        return user

    def update_profile(self, user: User, payload: ProfileUpdateRequest) -> User:
        if payload.full_name is not None:
            user.full_name = payload.full_name
        if payload.phone_number is not None:
            user.phone_number = payload.phone_number
        if payload.is_buyer is not None:
            user.is_buyer = payload.is_buyer
        if payload.is_seller is not None:
            user.is_seller = payload.is_seller
        return self.user_repository.save(user)

    def list_my_merchants(self, user: User) -> list[Merchant]:
        return self._merchant_repository_or_raise().list_by_owner(str(user.id))

    def create_merchant(self, user: User, payload: MerchantCreate) -> Merchant:
        user.is_seller = True
        self.user_repository.save(user)

        merchant = Merchant(
            owner_user_id=user.id,
            name=payload.name,
            email=payload.email,
            phone_number=payload.phone_number,
            till_number=payload.till_number,
        )
        return self._merchant_repository_or_raise().create(merchant)

    def update_merchant(self, user: User, merchant_id: UUID, payload: MerchantUpdate) -> Merchant:
        merchant_repo = self._merchant_repository_or_raise()
        merchant = merchant_repo.get_by_id(str(merchant_id))
        if merchant is None:
            raise ValueError("Store not found")
        if merchant.owner_user_id != user.id:
            raise PermissionError("You do not own this store")

        if payload.name is not None:
            merchant.name = payload.name
        if payload.email is not None:
            merchant.email = payload.email
        if payload.phone_number is not None:
            merchant.phone_number = payload.phone_number
        if payload.till_number is not None:
            merchant.till_number = payload.till_number

        return merchant_repo.save(merchant)
