from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def list_disputes() -> dict[str, str]:
    return {"message": "Not implemented yet"}
