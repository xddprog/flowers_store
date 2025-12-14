from uuid import UUID
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.repositories.base import SqlAlchemyRepository
from app.infrastructure.database.models.bouquet import Bouquet, BouquetFlowerType


class BouquetRepository(SqlAlchemyRepository[Bouquet]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Bouquet)

    async def add_item(
        self,
        name: str,
        description: str,
        price: int,
        bouquet_type_id: UUID,
        flower_type_ids: list[UUID] | None = None,
        quantity: int = 0,
        is_active: bool = True,
        **kwargs
    ) -> Bouquet:
        kwargs.pop("flower_type_ids", None)
        
        bouquet = Bouquet(
            name=name,
            description=description,
            price=price,
            bouquet_type_id=bouquet_type_id,
            quantity=quantity,
            is_active=is_active,
            **kwargs
        )
        self.session.add(bouquet)
        await self.session.flush()
        
        if flower_type_ids:
            for flower_type_id in flower_type_ids:
                bouquet_flower_type = BouquetFlowerType(
                    bouquet_id=bouquet.id,
                    flower_type_id=flower_type_id
                )
                self.session.add(bouquet_flower_type)
        
        await self.session.commit()
        await self.session.refresh(bouquet)
        return bouquet

    async def get_popular_bouquets(self, limit: int, offset: int) -> list[Bouquet]:
        query = (
            select(Bouquet)
            .order_by(Bouquet.purchase_count.desc(), Bouquet.view_count.desc())
            .options(selectinload(Bouquet.images))
            .limit(limit)
            .offset(offset)
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
            await self.session.refresh(bouquet)

    async def search_bouquets(
        self,
        bouquet_type_ids: list[UUID] | None = None,
        flower_type_ids: list[UUID] | None = None,
        price_min: int | None = None,
        price_max: int | None = None,
        limit: int = 20,
        offset: int = 0
    ) -> list[Bouquet]:
        query = select(Bouquet).options(selectinload(Bouquet.images))
        
        conditions = []
        
        if bouquet_type_ids:
            conditions.append(Bouquet.bouquet_type_id.in_(bouquet_type_ids))
        
        if price_min is not None:
            conditions.append(Bouquet.price >= price_min)
        
        if price_max is not None:
            conditions.append(Bouquet.price <= price_max)
        
        if flower_type_ids:
            subquery = (
                select(BouquetFlowerType.bouquet_id)
                .where(BouquetFlowerType.flower_type_id.in_(flower_type_ids))
                .distinct()
            )
            conditions.append(Bouquet.id.in_(subquery))
        
        if conditions:
            query = query.where(and_(*conditions))
        
        query = query.order_by(Bouquet.purchase_count.desc(), Bouquet.view_count.desc())
        query = query.limit(limit).offset(offset)
        
        result = await self.session.execute(query)
        return list(result.scalars().all())
