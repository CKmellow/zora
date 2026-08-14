from fastapi import APIRouter

from app.api.v1 import (
    auth,
    checkout,
    disputes,
    escrow,
    escrow_approvals,
    health,
    loop_payouts,
    merchants,
    orders,
    otp,
    payment_links,
    transactions,
    users,
    webhooks,
)

api_v1_router = APIRouter()

api_v1_router.include_router(health.router, tags=["health"])
api_v1_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_v1_router.include_router(otp.router, prefix="/auth/otp", tags=["otp"])
api_v1_router.include_router(users.router, prefix="/users", tags=["users"])
api_v1_router.include_router(merchants.router, prefix="/merchants", tags=["merchants"])
api_v1_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_v1_router.include_router(payment_links.router, prefix="/payment-links", tags=["payment-links"])
api_v1_router.include_router(checkout.router, prefix="/checkout", tags=["checkout"])
api_v1_router.include_router(loop_payouts.router, prefix="/loop", tags=["loop"])
api_v1_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_v1_router.include_router(escrow.router, prefix="/escrow", tags=["escrow"])
api_v1_router.include_router(escrow_approvals.router, prefix="/escrow", tags=["escrow-approvals"])
api_v1_router.include_router(disputes.router, prefix="/disputes", tags=["disputes"])
api_v1_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
