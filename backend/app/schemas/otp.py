from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class OtpIssueRequest(BaseModel):
    subject: str = Field(min_length=3, max_length=255)
    purpose: str = Field(default="login", min_length=3, max_length=64)
    channel: str = Field(default="sms", min_length=3, max_length=32)


class OtpIssueResponse(BaseModel):
    challenge_id: UUID
    expires_at: datetime
    attempts_remaining: int
    message: str


class OtpVerifyRequest(BaseModel):
    challenge_id: UUID
    code: str = Field(min_length=4, max_length=8)


class OtpVerifyResponse(BaseModel):
    challenge_id: UUID
    verified: bool
    attempts_remaining: int
    message: str
