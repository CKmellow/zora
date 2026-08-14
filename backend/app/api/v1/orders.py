from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.order import OrderCreate, OrderRead
from app.services.order_service import OrderService

router = APIRouter()


@router.post("", response_model=OrderRead)
async def create_order(payload: OrderCreate, db: Session = Depends(get_db)) -> OrderRead:
    service = OrderService(db)
    order = service.create_order(payload)
    return OrderRead.model_validate(order)


@router.get("/merchant/{merchant_id}", response_model=list[OrderRead])
async def list_merchant_orders(merchant_id: UUID, db: Session = Depends(get_db)) -> list[OrderRead]:
    service = OrderService(db)
    orders = service.list_merchant_orders(merchant_id)
    return [OrderRead.model_validate(order) for order in orders]
