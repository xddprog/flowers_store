from typing import Annotated
from fastapi import APIRouter, Depends

from app.core.dto.flower import FlowerTypeSchema
from app.api.v1.dependencies import get_flower_service
from app.core.services.flower_service import FlowerService


router = APIRouter()


@router.get("/")
async def get_all_flowers(
    service: Annotated[FlowerService, Depends(get_flower_service)],
) -> list[FlowerTypeSchema]:
    return await service.get_all()