from uuid import UUID

from app.core.dto.bouquet import BaseBouquetSchema, BouquetDetailSchema, BouquetFilterSchema
from app.core.dto.bouquet import BouquetCreateSchema, BouquetUpdateSchema
from app.core.repositories.bouquet_repository import BouquetRepository
from app.core.services.base import BaseDbModelService
from app.infrastructure.database.models.bouquet import Bouquet
from app.infrastructure.errors.base import NotFoundException


class BouquetService(BaseDbModelService[Bouquet]):
    def __init__(self, repository: BouquetRepository):
        self.repository = repository

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
        bouquet = await self.repository.add_item(**data.model_dump())
        return BaseBouquetSchema.model_validate(bouquet, from_attributes=True)

    async def update_bouquet(self, bouquet_id: UUID, data: BouquetUpdateSchema) -> BaseBouquetSchema:
        bouquet = await self.repository.update_item(str(bouquet_id), **data.model_dump(exclude_none=True))
        
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
