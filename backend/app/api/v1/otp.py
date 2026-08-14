from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_local_user_claims
from app.repositories.otp_repository import OtpRepository
from app.schemas.otp import OtpIssueRequest, OtpIssueResponse, OtpVerifyRequest, OtpVerifyResponse
from app.services.otp_service import OtpService

router = APIRouter()


@router.post("/issue", response_model=OtpIssueResponse)
async def issue_otp(
    payload: OtpIssueRequest,
    claims: dict = Depends(get_current_local_user_claims),
    db: Session = Depends(get_db),
) -> OtpIssueResponse:
    service = OtpService(otp_repository=OtpRepository(db))
    user_id = claims.get("sub")
    return service.issue(payload=payload, user_id=user_id)


@router.post("/verify", response_model=OtpVerifyResponse)
async def verify_otp(payload: OtpVerifyRequest, db: Session = Depends(get_db)) -> OtpVerifyResponse:
    service = OtpService(otp_repository=OtpRepository(db))
    return service.verify(payload)
