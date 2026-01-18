from uuid import UUID
from datetime import datetime
from attr import attr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.repositories.base import SqlAlchemyRepository
from app.infrastructure.database.models.order import Order, OrderItem, Payment
from app.utils.enums import OrderStatus, PaymentStatus
from app.core.dto.yandex_pay import CartItem


class OrderRepository(SqlAlchemyRepository[Order]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Order)

    async def create_order_with_items(
        self,
        order_data: dict,
        items_data: list[CartItem],
        total_amount: int,
    ) -> Order:
        order = Order(**order_data, total_amount=total_amount)
        self.session.add(order)
        await self.session.flush()
        
        for item_data in items_data:
            price_per_unit = float(item_data.total) / int(item_data.quantity.count)
            order_item = OrderItem(
                order_id=order.id,
                bouquet_id=item_data.product_id,
                quantity=int(item_data.quantity.count),
                price=int(price_per_unit)
            )
            self.session.add(order_item)
        
        payment = Payment(
            order_id=order.id,
            amount=total_amount,
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
                selectinload(Order.payment)
            )
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def update_status(
        self, 
        order_id: UUID,
        new_order_status: OrderStatus, 
        new_payment_status: PaymentStatus
    ) -> str | None:
        old_order_status, old_payment_status = None, None
        order = await self.session.get(
            self.model, 
            order_id, 
            options=[selectinload(self.model.payment)]
        )
        if not order:
            return None, None
        
        old_order_status = order.status
        old_payment_status = order.payment.status 

        order.status = new_order_status or order.status
        order.payment.status = new_payment_status or order.payment.status

        await self.session.commit()
        
        return old_order_status, old_payment_status
