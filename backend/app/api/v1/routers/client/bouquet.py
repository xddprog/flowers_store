from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, Query

from app.api.v1.dependencies import get_bouquet_service
from app.core.dto.bouquet import BaseBouquetSchema, BouquetDetailSchema, BouquetFilterSchema
from app.core.services.bouquet_service import BouquetService
from app.infrastructure.errors.base import NotFoundException
from app.utils.error_extra import error_response


router = APIRouter()


@router.get("/search")
async def search_bouquets(
    bouquet_service: Annotated[BouquetService, Depends(get_bouquet_service)],
    filters: BouquetFilterSchema = Query(),
) -> list[BaseBouquetSchema]:
    return await bouquet_service.search_bouquets(filters)


@router.get("/popular")
async def get_popular_bouquets(
    bouquet_service: Annotated[BouquetService, Depends(get_bouquet_service)],
    limit: int = 10,
    offset: int = 0,
) -> list[BaseBouquetSchema]:
    return await bouquet_service.get_popular_bouquets(limit, offset)


@router.get(
    "/{bouquet_id}",
    responses={**error_response(NotFoundException)},
)
async def get_bouquet_detail(
    bouquet_id: UUID,
    bouquet_service: Annotated[BouquetService, Depends(get_bouquet_service)]
) -> BouquetDetailSchema:
    return await bouquet_service.get_bouquet_detail(bouquet_id)