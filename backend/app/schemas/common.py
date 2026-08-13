from typing import Any

from pydantic import BaseModel


class ErrorResponse(BaseModel):
    error: str
    message: str
    details: Any | None = None


class MessageResponse(BaseModel):
    message: str
