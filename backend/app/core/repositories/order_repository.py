from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.repositories.base import SqlAlchemyRepository
from app.infrastructure.database.models.order import Order, OrderItem


class OrderRepository(SqlAlchemyRepository[Order]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Order)

    async def create_order_with_items(
        self,
        order_data: dict,
        items_data: list[dict],
        total_amount: int
    ) -> Order:
        order = Order(**order_data, total_amount=total_amount)
        self.session.add(order)
        await self.session.flush()
        
        for item_data in items_data:
            item_data["order_id"] = order.id
            order_item = OrderItem(**item_data)
            self.session.add(order_item)
        
        await self.session.commit()
        await self.session.refresh(order)
        
        return order
