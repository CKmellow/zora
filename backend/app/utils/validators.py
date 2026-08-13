from decimal import Decimal


def normalize_amount(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"))
