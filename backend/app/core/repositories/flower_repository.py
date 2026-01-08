from uuid import UUID
from app.core.repositories.base import SqlAlchemyRepository
from app.infrastructure.database.models.bouquet import BouquetFlowerType, FlowerType
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.infrastructure.errors.base import NotFoundException


class FlowerRepository(SqlAlchemyRepository[FlowerType]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, FlowerType)
        
    async def get_all_with_bouquet_count(self) -> list[FlowerType]:
        query = (
            select(
                FlowerType,
                func.count(BouquetFlowerType.bouquet_id).label("bouquet_count")
            )
            .outerjoin(BouquetFlowerType, FlowerType.id == BouquetFlowerType.flower_type_id)
            .group_by(FlowerType.id)
        )
        result = await self.session.execute(query)
        flower_types = []
        for flower_type, count in result.all():
            flower_type.bouquets_count = count or 0
            flower_types.append(flower_type)
        return flower_types

    async def validate_flower_types(self, flower_type_ids: list[UUID]) -> None:
        flower_types = await self.get_by_ids(flower_type_ids)
        if not flower_types:
            raise NotFoundException(f"Цветы с ID {flower_type_ids} не найдены")
        return flower_types