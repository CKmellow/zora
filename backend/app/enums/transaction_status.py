from enum import StrEnum


class TransactionStatus(StrEnum):
    PENDING = "PENDING"
    FUNDED = "FUNDED"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"
    SETTLED = "SETTLED"
    DISPUTED = "DISPUTED"
    REFUNDED = "REFUNDED"
