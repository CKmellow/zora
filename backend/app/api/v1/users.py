from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def list_users() -> dict[str, str]:
    return {"message": "Not implemented yet"}
