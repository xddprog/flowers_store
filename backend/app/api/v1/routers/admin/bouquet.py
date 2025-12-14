from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends

from app.api.v1.dependencies import get_bouquet_service
from app.core.dto.bouquet import  BouquetCreateSchema, BouquetUpdateSchema, BaseBouquetSchema
from app.core.services.bouquet_service import BouquetService
from app.infrastructure.errors.base import NotFoundException
from app.utils.error_extra import error_response


router = APIRouter()


@router.get("/")
async def get_all_bouquets(
    service: Annotated[BouquetService, Depends(get_bouquet_service)],
    limit: int = 10,
    offset: int = 0,
) -> list[BaseBouquetSchema]:
    return await service.get_all_bouquets(limit, offset)


@router.post("/")
async def create_bouquet(
    data: BouquetCreateSchema,
    service: Annotated[BouquetService, Depends(get_bouquet_service)]
) -> BaseBouquetSchema:
    return await service.create_bouquet(data)


@router.patch("/{bouquet_id}", responses={**error_response(NotFoundException)})
async def update_bouquet(
    bouquet_id: UUID,
    data: BouquetUpdateSchema,
    service: Annotated[BouquetService, Depends(get_bouquet_service)]
) -> BaseBouquetSchema:
    return await service.update_bouquet(bouquet_id, data)


@router.delete("/{bouquet_id}", responses={**error_response(NotFoundException)})
async def delete_bouquet(
    bouquet_id: UUID,
    service: Annotated[BouquetService, Depends(get_bouquet_service)]
) -> None:
    await service.delete_bouquet(bouquet_id)


@router.post("/{bouquet_id}/archive", responses={**error_response(NotFoundException)})
async def archive_bouquet(
    bouquet_id: UUID,
    service: Annotated[BouquetService, Depends(get_bouquet_service)]
) -> BaseBouquetSchema:
    return await service.archive_bouquet(bouquet_id)

