from uuid import UUID
from fastapi import BackgroundTasks, HTTPException, Request

from jose import jwt
from jose.exceptions import ExpiredSignatureError, JWTError


from app.core.dto.order import OrderAdminItemSchema, OrderCreateResponseSchema, OrderCreateSchema, OrderResponseSchema
from app.core.dto.order import OrderAdminSchema, OrderStatusUpdateSchema
from app.core.repositories.order_repository import OrderRepository
from app.core.services.base import BaseDbModelService
from app.infrastructure.database.models.order import Order
from app.infrastructure.errors.base import InternalServerError, NotFoundException
from app.utils.enums import OrderStatus, PaymentStatus
from app.core.clients import SMTPClients, TelegramClient, YandexPayClient
from app.core.dto.yandex_pay import Cart, CartItem, CartItemQuantity, CartTotal, OrderInfo, YandexPayWebhookDTO
from app.infrastructure.logging.logger import get_logger


logger = get_logger(__name__)

PACKAGING_TITLE = "Транспортировочная коробка"
PACKAGING_PRODUCT_ID = "packaging"
PACKAGING_FREE_THRESHOLD = 8000
PACKAGING_PRICE = 300


class OrderService(BaseDbModelService[Order]):
    def __init__(
        self, 
        repository: OrderRepository,
        smtp_client: SMTPClients,
        telegram_client: TelegramClient,
        yandex_pay_client: YandexPayClient
    ):
        self.repository = repository
        self.smtp_client = smtp_client
        self.telegram_client = telegram_client
        self.yandex_pay_client = yandex_pay_client

    async def _validate_token(self, request: Request):
        try:
            jwt_token = await request.body()
            jwks = await self.yandex_pay_client.get_jwks()

            payload = jwt.decode(jwt_token, jwks, algorithms=["ES256"])
            return payload
        except ExpiredSignatureError as e:
            logger.warning(f"Expired jwt: {str(e)}")
        except JWTError as e:
            logger.warning(f"Invalid jwt: {str(e)}")
        except Exception as e:
            logger.error(f"Jwt check error: {str(e)}")


    async def create_order(
        self, 
        order_data: OrderCreateSchema,
        cart_items: list[CartItem],
        background_tasks: BackgroundTasks
    ) -> OrderCreateResponseSchema:
        bouquet_total = sum(float(item.total) for item in cart_items)

        is_packaging_free = bouquet_total >= PACKAGING_FREE_THRESHOLD
        if is_packaging_free:
            order_data.has_packaging = True

        if order_data.has_packaging:
            packaging_price = 0 if is_packaging_free else PACKAGING_PRICE
            cart_items.append(
                CartItem(
                    product_id=PACKAGING_PRODUCT_ID,
                    quantity=CartItemQuantity(count=1, available=1),
                    title=PACKAGING_TITLE,
                    total=packaging_price,
                    description=PACKAGING_TITLE,
                )
            )

        total_amount = bouquet_total + (0 if is_packaging_free else (PACKAGING_PRICE if order_data.has_packaging else 0))
        order_payload = order_data.model_dump(
            exclude={"items", "payment_amount", "has_packaging"}
        )
        order_payload["has_packaging"] = order_data.has_packaging
        
        order = await self.repository.create_order_with_items(
            order_payload,
            cart_items, 
            total_amount
        )
        
        payment_url_or_exc = await self.yandex_pay_client.create_order(
            order_id=order.id,
            cart=Cart(
                items=cart_items,
                total=CartTotal(amount=total_amount)
            ),
            customer_email=order_data.customer_email,
            customer_phone=order_data.customer_phone
        )

        if isinstance(payment_url_or_exc, HTTPException):
            await self.repository.delete_item(order)
            raise payment_url_or_exc
        
        return OrderCreateResponseSchema(payment_url=payment_url_or_exc)

    async def get_all_orders(self, limit: int, offset: int) -> list[OrderAdminSchema]:
        orders = await self.repository.get_all_orders_with_relations(limit, offset)
        return [self._to_admin_schema(order) for order in orders]

    async def update_order_status_webhook(self, request: Request, background_tasks: BackgroundTasks):
        payload = await self._validate_token(request)
        logger.info("yandex_pay_webhook_received", payload=payload)
        if not payload:
            return {"status": "success"}

        webhook_data = YandexPayWebhookDTO.model_validate(payload)
        
        if webhook_data.event != "ORDER_STATUS_UPDATED" or not webhook_data.order:
            return {"status": "success"}

        new_order_status = None
        new_payment_status = None
        
        if webhook_data.order.payment_status == "CAPTURED":
            new_order_status = OrderStatus.PAID
            new_payment_status = PaymentStatus.PAID

        elif webhook_data.order.payment_status == "FAILED":
            new_order_status = OrderStatus.FAILED
            new_payment_status = PaymentStatus.FAILED

        elif webhook_data.order.payment_status in ["VOIDED", "REFUNDED"]:
            new_order_status = OrderStatus.CANCELLED
            new_payment_status = PaymentStatus.REFUNDED
        
        if new_payment_status or new_order_status:
            order_id = UUID(webhook_data.order.id)
            old_order_status, old_payment_status = await self.repository.update_status(
                order_id,
                new_order_status=new_order_status,
                new_payment_status=new_payment_status
            )
            if not old_order_status:
                logger.warning(f"Process empty order: order_id={webhook_data.order.id}, status={webhook_data.order.payment_status}")
                return

            if old_order_status == new_order_status and new_payment_status == old_payment_status:
                logger.warning(f"Process duplicate order: order_id={webhook_data.order.id}, status={webhook_data.order.payment_status}")
                return
                
            order_with_relations = await self.repository.get_order_with_relations(order_id)
            if new_order_status == OrderStatus.PAID:
                background_tasks.add_task(
                    self.telegram_client.send_payment_notification_to_admin,
                    order_with_relations,
                )
                background_tasks.add_task(
                    self.smtp_client.send_order_confirmation,
                    order_with_relations,
                )
            elif new_order_status != OrderStatus.FAILED:
                background_tasks.add_task(
                    self.smtp_client.send_order_status_change,
                    order_with_relations,
                    old_order_status
                )
                background_tasks.add_task(
                    self.telegram_client.send_order_status_change_to_admin,
                    order_with_relations,
                    old_order_status
                )
        return {"status": "success"}

    async def update_order_status(
        self, 
        order_id: UUID, 
        data: OrderStatusUpdateSchema,
        background_tasks: BackgroundTasks
    ) -> OrderAdminSchema:
        old_order = await self.repository.get_item(str(order_id))
        if not old_order:
            raise NotFoundException(f"Заказ с ID {order_id} не найден")
        
        old_status = old_order.status.value
        
        order = await self.repository.update_item(order_id, status=data.status)
        if not order:
            raise NotFoundException(f"Заказ с ID {order_id} не найден")
        
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
        
        order_with_relations = await self.repository.get_order_with_relations(order.id)
        return self._to_admin_schema(order_with_relations or order)

    async def delete_order(self, order_id: UUID) -> None:
        order = await self.repository.get_item(str(order_id))
        if not order:
            raise NotFoundException(f"Заказ с ID {order_id} не найден")
        await self.repository.delete_item(order)

    async def archive_order(self, order_id: UUID) -> OrderAdminSchema:
        order = await self.repository.update_item(order_id, is_active=True)
        if not order:
            raise NotFoundException(f"Заказ с ID {order_id} не найден")
        order_with_relations = await self.repository.get_order_with_relations(order.id)
        return self._to_admin_schema(order_with_relations or order)

    def _to_admin_schema(self, order: Order) -> OrderAdminSchema:
        return OrderAdminSchema(
            id=order.id,
            customer_email=order.customer_email,
            customer_phone=order.customer_phone,
            recipient_name=order.recipient_name,
            recipient_phone=order.recipient_phone,
            delivery_city=order.delivery_city,
            delivery_street=order.delivery_street,
            delivery_house=order.delivery_house,
            delivery_apartment=order.delivery_apartment,
            delivery_floor=order.delivery_floor,
            delivery_method=order.delivery_method,
            delivery_date=order.delivery_date,
            delivery_time_from=order.delivery_time_from,
            delivery_time_to=order.delivery_time_to,
            comment=order.comment,
            greeting_card_text=order.greeting_card_text,
            items=[
                OrderAdminItemSchema(
                    id=item.id,
                    bouquet_id=item.bouquet_id,
                    bouquet_name=item.bouquet.name if item.bouquet else "Позиция удалена",
                    quantity=item.quantity,
                    price=item.price,
                )
                for item in order.items
            ],
            total_amount=order.total_amount,
            status=order.status.value,
            is_active=order.is_active,
            created_at=order.created_at,
        )
