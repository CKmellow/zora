from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)
    phone_number: str | None = Field(default=None, max_length=32)
    wants_to_buy: bool = True
    wants_to_sell: bool = False
    store_name: str | None = Field(default=None, max_length=255)
    till_number: str | None = Field(default=None, max_length=64)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class AuthResponse(BaseModel):
    user_id: UUID
    is_buyer: bool
    is_seller: bool
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class AuthUserProfile(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str | None
    phone_number: str | None
    is_active: bool
    is_buyer: bool
    is_seller: bool
    created_at: datetime
    updated_at: datetime


class AuthMeResponse(BaseModel):
    user: AuthUserProfile


class ProfileUpdateRequest(BaseModel):
    full_name: str | None = Field(default=None, max_length=255)
    phone_number: str | None = Field(default=None, max_length=32)
    is_buyer: bool | None = None
    is_seller: bool | None = None


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)
