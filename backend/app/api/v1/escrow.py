from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def escrow_status() -> dict[str, str]:
    return {"message": "Not implemented yet"}
