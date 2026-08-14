import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta

from app.models.otp_challenge import OtpChallenge
from app.repositories.otp_repository import OtpRepository
from app.schemas.otp import OtpIssueRequest, OtpIssueResponse, OtpVerifyRequest, OtpVerifyResponse


class OtpService:
    def __init__(self, otp_repository: OtpRepository):
        self.otp_repository = otp_repository

    def issue(self, payload: OtpIssueRequest, user_id: str | None) -> OtpIssueResponse:
        now = datetime.now(UTC)
        code = f"{secrets.randbelow(1000000):06d}"
        challenge = OtpChallenge(
            user_id=user_id,
            purpose=payload.purpose,
            subject=payload.subject,
            channel=payload.channel,
            code_hash=self._hash_code(code),
            attempts_remaining=3,
            expires_at=now + timedelta(minutes=10),
            verified_at=None,
            last_error=None,
        )
        created = self.otp_repository.create(challenge)

        # NOTE: In production this code should be sent via SMS/Email provider, not returned.
        return OtpIssueResponse(
            challenge_id=created.id,
            expires_at=created.expires_at,
            attempts_remaining=created.attempts_remaining,
            message=f"OTP issued. Dev code: {code}",
        )

    def verify(self, payload: OtpVerifyRequest) -> OtpVerifyResponse:
        now = datetime.now(UTC)
        challenge = self.otp_repository.get_by_id(payload.challenge_id)
        if challenge is None:
            return OtpVerifyResponse(
                challenge_id=payload.challenge_id,
                verified=False,
                attempts_remaining=0,
                message="Challenge not found",
            )

        if challenge.verified_at is not None:
            return OtpVerifyResponse(
                challenge_id=challenge.id,
                verified=True,
                attempts_remaining=challenge.attempts_remaining,
                message="Already verified",
            )

        if self.otp_repository.is_expired(challenge, now):
            challenge.last_error = "expired"
            self.otp_repository.save(challenge)
            return OtpVerifyResponse(
                challenge_id=challenge.id,
                verified=False,
                attempts_remaining=challenge.attempts_remaining,
                message="OTP expired",
            )

        if challenge.attempts_remaining <= 0:
            challenge.last_error = "attempts_exhausted"
            self.otp_repository.save(challenge)
            return OtpVerifyResponse(
                challenge_id=challenge.id,
                verified=False,
                attempts_remaining=0,
                message="No attempts remaining",
            )

        if not self._verify_code(payload.code, challenge.code_hash):
            challenge.attempts_remaining -= 1
            challenge.last_error = "invalid_code"
            self.otp_repository.save(challenge)
            return OtpVerifyResponse(
                challenge_id=challenge.id,
                verified=False,
                attempts_remaining=challenge.attempts_remaining,
                message="Invalid OTP code",
            )

        challenge.verified_at = now
        challenge.last_error = None
        self.otp_repository.save(challenge)
        return OtpVerifyResponse(
            challenge_id=challenge.id,
            verified=True,
            attempts_remaining=challenge.attempts_remaining,
            message="OTP verified",
        )

    def _hash_code(self, code: str) -> str:
        salt = secrets.token_hex(8)
        digest = hashlib.sha256(f"{salt}:{code}".encode()).hexdigest()
        return f"sha256${salt}${digest}"

    def _verify_code(self, code: str, stored_hash: str) -> bool:
        try:
            _, salt, digest = stored_hash.split("$", 2)
        except ValueError:
            return False
        computed = hashlib.sha256(f"{salt}:{code}".encode()).hexdigest()
        return hmac.compare_digest(computed, digest)
