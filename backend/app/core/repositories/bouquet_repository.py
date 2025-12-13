from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.repositories.base import SqlAlchemyRepository
from infrastructure.database.models.bouquet import Bouquet


class BouquetRepository(SqlAlchemyRepository[Bouquet]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Bouquet)

    async def get_popular_bouquets(self, limit: int = 10) -> list[Bouquet]:
        query = (
            select(Bouquet)
            .order_by(Bouquet.purchase_count.desc(), Bouquet.view_count.desc())
            .limit(limit)
            .options(selectinload(Bouquet.images))
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_bouquet_detail(self, bouquet_id: str) -> Bouquet | None:
        query = (
            select(Bouquet)
            .where(Bouquet.id == bouquet_id)
            .options(
                selectinload(Bouquet.images),
                selectinload(Bouquet.bouquet_type),
                selectinload(Bouquet.flower_types)
            )
        )
        result = await self.session.execute(query)
        return result.scalars().one_or_none()

    async def increment_view_count(self, bouquet_id: str) -> None:
        query = (
            select(Bouquet)
            .where(Bouquet.id == bouquet_id)
        )
        result = await self.session.execute(query)
        bouquet = result.scalars().one_or_none()
        if bouquet:
            bouquet.view_count += 1
            await self.session.commit()

