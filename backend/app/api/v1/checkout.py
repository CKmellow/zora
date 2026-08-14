from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.order import CheckoutPayRequest, CheckoutPayResponse, PublicOrderRead
from app.services.order_service import OrderService

router = APIRouter()


@router.get("/orders/{order_code}", response_model=PublicOrderRead)
async def get_public_order(order_code: str, db: Session = Depends(get_db)) -> PublicOrderRead:
    service = OrderService(db)
    order = service.get_public_order(order_code)
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    return PublicOrderRead(
        order_code=order.order_code,
        item_name=order.item_name,
        item_description=order.item_description,
        item_image_url=order.item_image_url,
        amount=order.amount,
        currency=order.currency,
        buyer_name=order.buyer_name,
        status=order.status,
    )


@router.post("/orders/{order_code}/pay", response_model=CheckoutPayResponse)
async def checkout_pay(
    order_code: str,
    payload: CheckoutPayRequest,
    db: Session = Depends(get_db),
) -> CheckoutPayResponse:
    service = OrderService(db)
    response = service.initiate_checkout(order_code=order_code, phone_number=payload.phone_number)
    if response is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return response
