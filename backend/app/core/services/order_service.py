from uuid import UUID

from app.core.dto.order import OrderCreateSchema, OrderResponseSchema
from app.core.dto.order import OrderAdminSchema, OrderStatusUpdateSchema
from app.core.repositories.order_repository import OrderRepository
from app.core.services.base import BaseDbModelService
from app.infrastructure.database.models.order import Order
from app.infrastructure.errors.base import NotFoundException
from app.utils.enums import OrderStatus, PaymentStatus


class OrderService(BaseDbModelService[Order]):
    def __init__(self, repository: OrderRepository):
        self.repository = repository

    async def create_order(self, order_data: OrderCreateSchema) -> OrderResponseSchema:
        total_amount = sum(item.price * item.quantity for item in order_data.items)
        order_data = order_data.model_dump()
        items = order_data.pop("items")
        order = await self.repository.create_order_with_items(order_data, items, total_amount)
        
        ##payment create
        
        return OrderResponseSchema.model_validate(order, from_attributes=True)

    async def get_all_orders(self, limit: int, offset: int) -> list[OrderAdminSchema]:
        orders = await self.repository.get_all_items(limit, offset)
        return [OrderAdminSchema.model_validate(o, from_attributes=True) for o in orders]

    async def update_order_status(self, order_id: UUID, data: OrderStatusUpdateSchema) -> OrderAdminSchema:
        order = await self.repository.update_item(order_id, status=data.status)
        if not order:
            raise NotFoundException(f"Заказ с ID {order_id} не найден")
        return OrderAdminSchema.model_validate(order, from_attributes=True)

    async def delete_order(self, order_id: UUID) -> None:
        order = await self.repository.get_item(str(order_id))
        if not order:
            raise NotFoundException(f"Заказ с ID {order_id} не найден")
        await self.repository.delete_item(order)

    async def archive_order(self, order_id: UUID) -> OrderAdminSchema:
        order = await self.repository.update_item(order_id, is_active=True)
        if not order:
            raise NotFoundException(f"Заказ с ID {order_id} не найден")
        return OrderAdminSchema.model_validate(order, from_attributes=True)

