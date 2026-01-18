from uuid import UUID
from fastapi import UploadFile

from app.core.dto.bouquet import (
    BaseBouquetSchema, 
    BouquetDetailSchema, 
    BouquetFilterSchema,
    BouquetCreateSchema,
    AdminBouquetTypeSchema,
    BouquetUpdateSchema,
    BouquetImageSchema,
)
from app.core.repositories.bouquet_repository import BouquetRepository
from app.core.services.base import BaseDbModelService
from app.core.services.image_service import ImageService
from app.infrastructure.database.models.bouquet import Bouquet
from app.infrastructure.errors.base import NotFoundException
from app.core.dto.order import OrderItemCreateSchema
from app.core.dto.yandex_pay import CartItem, CartItemQuantity
from app.core.dto.flower import FlowerTypeSchema
from app.core.dto.bouquet import BouquetTypeSchema


class BouquetService(BaseDbModelService[Bouquet]):
    def __init__(self, repository: BouquetRepository, image_service: ImageService):
        self.repository = repository
        self.image_service = image_service

    async def get_bouquet_types(self) -> list[AdminBouquetTypeSchema]:
        bouquet_types = await self.repository.get_bouquet_types_with_bouquet_count()
        return [AdminBouquetTypeSchema.model_validate(bouquet_type, from_attributes=True) for bouquet_type in bouquet_types]

    async def get_bouquet_types_from_client(self) -> list[BouquetTypeSchema]:
        bouquet_types = await self.repository.get_bouquet_types()
        return [BouquetTypeSchema.model_validate(bouquet_type, from_attributes=True) for bouquet_type in bouquet_types]

    async def get_popular_bouquets(self, limit: int, offset: int) -> list[BaseBouquetSchema]:
        bouquets = await self.repository.get_popular_bouquets(limit, offset)
        
        for bouquet in bouquets:
            if bouquet.images:
                bouquet.main_image = sorted(bouquet.images, key=lambda x: x.order)[0]
                
        return [
            BaseBouquetSchema.model_validate(bouquet, from_attributes=True)
            for bouquet in bouquets
        ]

    async def get_bouquet_detail(self, bouquet_id: UUID) -> BouquetDetailSchema:
        bouquet = await self.repository.get_bouquet_detail(str(bouquet_id))
        
        if not bouquet:
            raise NotFoundException(f"Букет с ID {bouquet_id} не найден")
        
        await self.repository.increment_view_count(str(bouquet_id))
        return BouquetDetailSchema.model_validate(bouquet, from_attributes=True)

    async def search_bouquets(self, filters: BouquetFilterSchema) -> list[BaseBouquetSchema]:
        bouquets = await self.repository.search_bouquets(**filters.model_dump())
        
        for bouquet in bouquets:
            if bouquet.images:
                bouquet.main_image = sorted(bouquet.images, key=lambda x: x.order)[0]
        
        return [
            BaseBouquetSchema.model_validate(bouquet, from_attributes=True)
            for bouquet in bouquets
        ]

    async def get_all_bouquets(self, limit: int, offset: int) -> list[BaseBouquetSchema]:
        bouquets = await self.repository.search_bouquets(limit=limit, offset=offset)
        
        for bouquet in bouquets:
            if bouquet.images:
                bouquet.main_image = sorted(bouquet.images, key=lambda x: x.order)[0]
        
        return [BaseBouquetSchema.model_validate(b, from_attributes=True) for b in bouquets]

    async def create_bouquet(self, data: BouquetCreateSchema) -> BaseBouquetSchema:
        bouquet_type = await self.repository.get_bouquet_type(data.bouquet_type_id)
        if not bouquet_type:
            raise NotFoundException(f"Тип букета с ID {data.bouquet_type_id} не найден")
            
        bouquet = await self.repository.add_item(**data.model_dump())
        return BaseBouquetSchema.model_validate(bouquet, from_attributes=True)

    async def update_bouquet(self, bouquet_id: UUID, data: BouquetUpdateSchema) -> BaseBouquetSchema:
        update_data = data.model_dump(exclude_none=True)
        flower_type_ids = update_data.pop("flower_type_ids", None)
        
        bouquet = await self.repository.update_item(
            str(bouquet_id),
            flower_type_ids=flower_type_ids,
            **update_data
        )
        
        if not bouquet:
            raise NotFoundException(f"Букет с ID {bouquet_id} не найден")
        
        return BaseBouquetSchema.model_validate(bouquet, from_attributes=True)

    async def delete_bouquet(self, bouquet_id: UUID) -> None:
        bouquet = await self.repository.get_item(str(bouquet_id))
        if not bouquet:
            raise NotFoundException(f"Букет с ID {bouquet_id} не найден")
        await self.repository.delete_item(bouquet)

    async def archive_bouquet(self, bouquet_id: UUID) -> BaseBouquetSchema:
        bouquet = await self.repository.update_item(bouquet_id, is_active=False)
        if not bouquet:
            raise NotFoundException(f"Букет с ID {bouquet_id} не найден")
        return BaseBouquetSchema.model_validate(bouquet, from_attributes=True)

    async def update_image_order(
        self, 
        bouquet_id: UUID, 
        image_id: UUID, 
        order: int
    ) -> list[BouquetImageSchema]:
        images = await self.repository.update_image_order(bouquet_id, image_id, order)
        
        if not images:
            raise NotFoundException(f"Изображение с ID {image_id} не найдено в букете {bouquet_id}")
        
        return [BouquetImageSchema.model_validate(image, from_attributes=True) for image in images]

    async def upload_images(
        self,
        bouquet_id: UUID,
        files: list[UploadFile]
    ) -> list[BouquetImageSchema]:
        bouquet = await self.repository.get_item(str(bouquet_id))
        if not bouquet:
            raise NotFoundException(f"Букет с ID {bouquet_id} не найден")
        
        image_paths = await self.image_service.upload_multiple(files, subfolder="bouquets")
        images = await self.repository.add_images(bouquet_id, image_paths)
        
        return [BouquetImageSchema.model_validate(image, from_attributes=True) for image in images]

    async def get_bouquets_to_order(self, bouquets: list[OrderItemCreateSchema]) -> list[CartItem]:
        db_bouquets = await self.repository.get_by_ids([item.bouquet_id for item in bouquets])
        db_bouquets_map = {bouquet.id: bouquet for bouquet in db_bouquets}

        items = []
        for bouquet in bouquets:
            db_bouquet = db_bouquets_map.get(bouquet.bouquet_id)

            if db_bouquet is None:
                raise NotFoundException(f"Букет {bouquet.title} не найден")
            if db_bouquet.quantity < bouquet.quantity:
                raise NotFoundException(f"Недостаточно {bouquet.title} на складе, уменьшите количество")

            items.append(
                CartItem(
                    product_id=str(db_bouquet.id),
                    quantity=CartItemQuantity(
                        count=bouquet.quantity,
                        available=db_bouquet.quantity
                    ),
                    title=db_bouquet.name,
                    total=db_bouquet.price,
                    description=db_bouquet.description
                )
            )
        
        return items