from uuid import UUID
from app.core.repositories.flower_repository import FlowerRepository
from app.core.services.base import BaseDbModelService
from app.core.dto.flower import FlowerTypeSchema
from app.infrastructure.database.models.bouquet import FlowerType
from app.infrastructure.errors.base import NotFoundException


class FlowerService(BaseDbModelService[FlowerType]):
    def __init__(self, repository: FlowerRepository):
        self.repository = repository

    async def get_all(self) -> list[FlowerTypeSchema]:
        flower_types = await self.repository.get_all()
        return [FlowerTypeSchema.model_validate(flower_type, from_attributes=True) for flower_type in flower_types]

    async def validate_flower_types(self, flower_type_ids: list[UUID]) -> None:
        flower_types = await self.repository.get_by_ids(flower_type_ids)
        if len(flower_types) != len(flower_type_ids):
            raise NotFoundException(f"Цветы с ID {[str(i) for i in flower_type_ids] if flower_type_ids else []} не найдены")