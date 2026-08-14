from fastapi import APIRouter

from app.api.v1 import (
    auth,
    disputes,
    escrow,
    health,
    merchants,
    payment_links,
    payouts,
    transactions,
    users,
    webhooks,
)

api_v1_router = APIRouter()

api_v1_router.include_router(health.router, tags=["health"])
api_v1_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_v1_router.include_router(users.router, prefix="/users", tags=["users"])
api_v1_router.include_router(merchants.router, prefix="/merchants", tags=["merchants"])
api_v1_router.include_router(payment_links.router, prefix="/payment-links", tags=["payment-links"])
api_v1_router.include_router(payouts.router, prefix="/payouts", tags=["payouts"])
api_v1_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_v1_router.include_router(escrow.router, prefix="/escrow", tags=["escrow"])
api_v1_router.include_router(disputes.router, prefix="/disputes", tags=["disputes"])
api_v1_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
