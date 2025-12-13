from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, Query

from api.v1.dependencies import get_bouquet_service
from core.dto.bouquet import BaseBouquetSchema, BouquetDetailSchema
from core.services.bouquet_service import BouquetService
from infrastructure.errors.base import NotFoundException
from utils.error_extra import error_response


router = APIRouter()


@router.get(
    "/popular",
    response_model=list[BaseBouquetSchema],
)
async def get_popular_bouquets(
    limit: Annotated[int, Query(ge=1, le=100, default=10)] = 10,
    bouquet_service: Annotated[BouquetService, Depends(get_bouquet_service)] = None
) -> list[BaseBouquetSchema]:
    return await bouquet_service.get_popular_bouquets(limit)


@router.get(
    "/{bouquet_id}",
    response_model=BouquetDetailSchema,
    responses={**error_response(NotFoundException)},
)
async def get_bouquet_detail(
    bouquet_id: UUID,
    bouquet_service: Annotated[BouquetService, Depends(get_bouquet_service)] = None
) -> BouquetDetailSchema:
    return await bouquet_service.get_bouquet_detail(bouquet_id)