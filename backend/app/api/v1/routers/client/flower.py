from typing import Annotated
from fastapi import APIRouter, Depends

from app.api.v1.dependencies import get_flower_service
from app.core.services.flower_service import FlowerService
from backend.app.core.dto.bouquet import BouquetFlowerTypeSchema


router = APIRouter()


@router.get("/")
async def get_all_flowers(
    service: Annotated[FlowerService, Depends(get_flower_service)],
) -> list[BouquetFlowerTypeSchema]:
    return await service.get_all_from_client()