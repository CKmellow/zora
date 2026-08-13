from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


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
