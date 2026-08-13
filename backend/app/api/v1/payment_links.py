from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def list_payment_links() -> dict[str, str]:
    return {"message": "Not implemented yet"}
