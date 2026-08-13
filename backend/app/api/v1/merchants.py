from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def list_merchants() -> dict[str, str]:
    return {"message": "Not implemented yet"}
