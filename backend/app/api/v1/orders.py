from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_optional_local_user_claims
from app.schemas.order import OrderCreate, OrderRead
from app.services.order_service import OrderService

router = APIRouter()


@router.post("", response_model=OrderRead)
async def create_order(
    payload: OrderCreate,
    claims: dict | None = Depends(get_optional_local_user_claims),
    db: Session = Depends(get_db),
) -> OrderRead:
    service = OrderService(db)
    try:
        owner_user_id = UUID(claims["sub"]) if claims else None
        order = service.create_order(payload, owner_user_id=owner_user_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order payload for current merchant state",
        ) from exc
    return OrderRead.model_validate(order)


@router.get("/merchant/{merchant_id}", response_model=list[OrderRead])
async def list_merchant_orders(merchant_id: UUID, db: Session = Depends(get_db)) -> list[OrderRead]:
    service = OrderService(db)
    orders = service.list_merchant_orders(merchant_id)
    return [OrderRead.model_validate(order) for order in orders]
