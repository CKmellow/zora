from enum import StrEnum


class DisputeStatus(StrEnum):
    OPEN = "OPEN"
    UNDER_REVIEW = "UNDER_REVIEW"
    RESOLVED = "RESOLVED"
    REFUNDED = "REFUNDED"
    REJECTED = "REJECTED"
