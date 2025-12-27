from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, File, UploadFile

from app.api.v1.dependencies import get_bouquet_service
from app.core.dto.bouquet import (
    BouquetCreateSchema,
    BouquetDetailSchema, 
    BouquetUpdateSchema, 
    BaseBouquetSchema,
    ImageOrderUpdateSchema,
    BouquetImageSchema
)
from app.core.services.bouquet_service import BouquetService
from app.infrastructure.errors.base import NotFoundException
from app.infrastructure.errors.image_errors import (
    InvalidImageType,
    InvalidImageFormat,
    ImageTooLarge,
    EmptyImageFile,
    ImageProcessingError
)
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


@router.get("/{bouquet_id}", responses={**error_response(NotFoundException)})
async def get_bouquet_detail(
    bouquet_id: UUID,
    service: Annotated[BouquetService, Depends(get_bouquet_service)]
) -> BouquetDetailSchema:
    return await service.get_bouquet_detail(bouquet_id)


@router.put("/{bouquet_id}", responses={**error_response(NotFoundException)})
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


@router.post(
    "/{bouquet_id}/images",
    responses={
        **error_response(NotFoundException),
        **error_response(InvalidImageType),
        **error_response(InvalidImageFormat),
        **error_response(ImageTooLarge),
        **error_response(EmptyImageFile),
        **error_response(ImageProcessingError),
    }
)
async def upload_images(
    bouquet_id: UUID,
    files: Annotated[list[UploadFile], File(...)],
    service: Annotated[BouquetService, Depends(get_bouquet_service)]
) -> list[BouquetImageSchema]:
    return await service.upload_images(bouquet_id, files)


@router.patch(
    "/{bouquet_id}/images/{image_id}/order", 
    responses={**error_response(NotFoundException)}
)
async def update_image_order(
    bouquet_id: UUID,
    image_id: UUID,
    data: ImageOrderUpdateSchema,
    service: Annotated[BouquetService, Depends(get_bouquet_service)]
) -> list[BouquetImageSchema]:
    return await service.update_image_order(bouquet_id, image_id, data.order)

