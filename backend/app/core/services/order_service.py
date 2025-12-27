from uuid import UUID
from fastapi import BackgroundTasks

from app.core.dto.order import OrderCreateSchema, OrderResponseSchema
from app.core.dto.order import OrderAdminSchema, OrderStatusUpdateSchema
from app.core.repositories.order_repository import OrderRepository
from app.core.services.base import BaseDbModelService
from app.infrastructure.database.models.order import Order
from app.infrastructure.errors.base import NotFoundException
from app.utils.enums import OrderStatus
from app.core.clients import SMTPClients, TelegramClient


class OrderService(BaseDbModelService[Order]):
    def __init__(
        self, 
        repository: OrderRepository,
        smtp_client: SMTPClients,
        telegram_client: TelegramClient
    ):
        self.repository = repository
        self.smtp_client = smtp_client
        self.telegram_client = telegram_client

    async def create_order(
        self, 
        order_data: OrderCreateSchema, 
        background_tasks: BackgroundTasks
    ) -> OrderResponseSchema:
        total_amount = sum(item.price * item.quantity for item in order_data.items)
        order_data_dict = order_data.model_dump()
        items = order_data_dict.pop("items")
        payment_method = order_data_dict.pop("payment_method")
        payment_amount = order_data_dict.pop("payment_amount")
        
        order = await self.repository.create_order_with_items(
            order_data_dict, 
            items, 
            total_amount,
            payment_amount,
            payment_method
        )
        
        order_with_relations = await self.repository.get_order_with_relations(order.id)
        
        background_tasks.add_task(
            self.smtp_client.send_order_confirmation,
            order_with_relations
        )
        background_tasks.add_task(
            self.telegram_client.send_payment_notification_to_admin,
            order_with_relations
        )
        
        return OrderResponseSchema.model_validate(order_with_relations, from_attributes=True)


    async def get_all_orders(self, limit: int, offset: int) -> list[OrderAdminSchema]:
        orders = await self.repository.get_all_items(limit, offset)
        return [OrderAdminSchema.model_validate(o, from_attributes=True) for o in orders]

    async def update_order_status(
        self, 
        order_id: UUID, 
        data: OrderStatusUpdateSchema,
        background_tasks: BackgroundTasks
    ) -> OrderAdminSchema:
        # Получаем заказ до обновления для сохранения старого статуса
        old_order = await self.repository.get_item(str(order_id))
        if not old_order:
            raise NotFoundException(f"Заказ с ID {order_id} не найден")
        
        old_status = old_order.status.value
        
        # Обновляем статус
        order = await self.repository.update_item(order_id, status=data.status)
        if not order:
            raise NotFoundException(f"Заказ с ID {order_id} не найден")
        
        # Загружаем заказ со связями для уведомлений
        order_with_relations = await self.repository.get_order_with_relations(order.id)
        
        if order_with_relations and old_status != order.status.value:
            background_tasks.add_task(
                self.smtp_client.send_order_status_change,
                order_with_relations,
                old_status
            )
            background_tasks.add_task(
                self.telegram_client.send_order_status_change_to_admin,
                order_with_relations,
                old_status
            )
        
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

