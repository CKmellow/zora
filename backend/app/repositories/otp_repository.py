from datetime import datetime
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.otp_challenge import OtpChallenge


class OtpRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, challenge: OtpChallenge) -> OtpChallenge:
        self.db.add(challenge)
        self.db.commit()
        self.db.refresh(challenge)
        return challenge

    def get_by_id(self, challenge_id: UUID) -> OtpChallenge | None:
        return self.db.query(OtpChallenge).filter(OtpChallenge.id == challenge_id).first()

    def save(self, challenge: OtpChallenge) -> OtpChallenge:
        self.db.add(challenge)
        self.db.commit()
        self.db.refresh(challenge)
        return challenge

    @staticmethod
    def is_expired(challenge: OtpChallenge, now: datetime) -> bool:
        return challenge.expires_at <= now
