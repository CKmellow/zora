from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class MerchantCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    phone_number: str | None = Field(default=None, max_length=32)
    till_number: str | None = Field(default=None, max_length=64)


class MerchantUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    email: EmailStr | None = None
    phone_number: str | None = Field(default=None, max_length=32)
    till_number: str | None = Field(default=None, max_length=64)


class MerchantRead(BaseModel):
    id: UUID
    owner_user_id: UUID
    name: str
    email: EmailStr
    phone_number: str | None
    till_number: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
