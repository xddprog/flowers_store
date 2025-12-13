from uuid import UUID

from core.dto.bouquet import BaseBouquetSchema, BouquetDetailSchema
from core.repositories.bouquet_repository import BouquetRepository
from core.services.base import BaseDbModelService
from infrastructure.database.models.bouquet import Bouquet
from infrastructure.errors.base import NotFoundException


class BouquetService(BaseDbModelService[Bouquet]):
    def __init__(self, repository: BouquetRepository):
        self.repository = repository

    async def get_popular_bouquets(self, limit: int, offset: int) -> list[BaseBouquetSchema]:
        bouquets = await self.repository.get_popular_bouquets(limit)
        
        for bouquet in bouquets:
            if bouquet.images:
                bouquet.main_image = sorted(bouquet.images, key=lambda x: x.order)[0].image_path
                
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

