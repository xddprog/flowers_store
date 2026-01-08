from uuid import UUID
from sqlalchemy import select, and_, update, func, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.repositories.base import SqlAlchemyRepository
from app.infrastructure.database.models.bouquet import Bouquet, BouquetFlowerType, BouquetImage, BouquetType, FlowerType
from app.utils.enums import BouquetSort


class BouquetRepository(SqlAlchemyRepository[Bouquet]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Bouquet)

    async def get_bouquet_types_with_bouquet_count(self) -> list[tuple[BouquetType, int]]:
        query = (
            select(
                BouquetType,
                func.count(Bouquet.id).label("bouquets_count")
            )
            .outerjoin(Bouquet, BouquetType.id == Bouquet.bouquet_type_id)
            .group_by(BouquetType.id)
        )
        result = await self.session.execute(query)
        bouquet_types = []
        for bouquet_type, count in result.all():
            bouquet_type.bouquets_count = count or 0
            bouquet_types.append(bouquet_type)
        return bouquet_types

    async def get_bouquet_types(self) -> list[BouquetType]:
        query = select(BouquetType)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_bouquet_type(self, bouquet_type_id: UUID) -> None:
        return await self.session.get(BouquetType, bouquet_type_id)

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
        offset: int = 0,
        sort: BouquetSort = BouquetSort.POPULAR
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
        
        if sort == BouquetSort.POPULAR:
            query = query.order_by(desc(Bouquet.purchase_count), desc(Bouquet.view_count))
        elif sort == BouquetSort.PRICE_ASC:
            query = query.order_by(asc(Bouquet.price))
        elif sort == BouquetSort.PRICE_DESC:
            query = query.order_by(desc(Bouquet.price))
        
        query = query.limit(limit).offset(offset)
        
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def update_image_order(
        self, 
        bouquet_id: UUID, 
        image_id: UUID, 
        new_order: int
    ) -> list[BouquetImage]:
        images = (
            await self.session.execute(
                select(BouquetImage)
                .where(
                    BouquetImage.bouquet_id == bouquet_id
                )
                .order_by(BouquetImage.order)
            )
        ).scalars().all()
        updated_image = next((image for image in images if image.id == image_id), None)
        if not updated_image:
            return []
        
        old_order = updated_image.order
        new_order = max(0, min(new_order, len(images) - 1))
        
        if old_order == new_order:
            return list(images)
        
        images_without_current = [img for img in images if img.id != image_id]
        
        images_without_current.insert(new_order, updated_image)
        
        for index, image in enumerate(images_without_current):
            image.order = index
        
        await self.session.commit()
        
        for image in images_without_current:
            await self.session.refresh(image)
        
        return images_without_current

    async def add_images(
        self,
        bouquet_id: UUID,
        image_paths: list[str]
    ) -> list[BouquetImage]:
        max_order_query = select(BouquetImage.order).where(
            BouquetImage.bouquet_id == bouquet_id
        ).order_by(BouquetImage.order.desc()).limit(1)
        max_result = await self.session.execute(max_order_query)
        max_order_row = max_result.scalar_one_or_none()
        start_order = (max_order_row + 1) if max_order_row is not None else 0
        
        new_images = []
        for index, image_path in enumerate(image_paths):
            image = BouquetImage(
                bouquet_id=bouquet_id,
                image_path=image_path,
                order=start_order + index
            )
            self.session.add(image)
            new_images.append(image)
        
        await self.session.commit()
        
        for image in new_images:
            await self.session.refresh(image)
        
        return new_images

    