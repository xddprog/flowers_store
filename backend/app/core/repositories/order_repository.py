from uuid import UUID
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.repositories.base import SqlAlchemyRepository
from app.infrastructure.database.models.order import Order, OrderItem, Payment
from app.utils.enums import PaymentStatus


class OrderRepository(SqlAlchemyRepository[Order]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Order)

    async def create_order_with_items(
        self,
        order_data: dict,
        items_data: list[dict],
        total_amount: int,
        payment_amount: int,
        payment_method
    ) -> Order:
        order = Order(**order_data, total_amount=total_amount)
        self.session.add(order)
        await self.session.flush()
        
        for item_data in items_data:
            item_data["order_id"] = order.id
            order_item = OrderItem(**item_data)
            self.session.add(order_item)
        
        payment = Payment(
            order_id=order.id,
            amount=payment_amount,
            payment_method=payment_method,
            status=PaymentStatus.PENDING
        )
        self.session.add(payment)
        
        await self.session.commit()
        await self.session.refresh(order)
        
        return order

    async def get_order_with_relations(self, order_id: UUID) -> Order | None:
        query = (
            select(Order)
            .where(Order.id == order_id)
            .options(
                selectinload(Order.items).selectinload(OrderItem.bouquet),
                selectinload(Order.payments)
            )
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
