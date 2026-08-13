from pydantic import BaseModel


class EscrowStatusResponse(BaseModel):
    message: str
