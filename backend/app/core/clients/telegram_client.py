import aiohttp

from app.infrastructure.config.config import TELEGRAM_CONFIG
from app.infrastructure.logging.logger import get_logger
from app.infrastructure.database.models.order import Order

logger = get_logger(__name__)




class TelegramClient:
    def __init__(self):
        self.bot_token = TELEGRAM_CONFIG.BOT_TOKEN
        self.admin_chat_id = TELEGRAM_CONFIG.ADMIN_CHAT_ID
        self.status_messages = {
            "pending": "Ожидание оплаты",
            "paid": "Оплачен",
            "failed": "Ошибка",
            "processing": "Обрабатывается",
            "completed": "Выполнен",
            "cancelled": "Отменен",
        }

    async def send_message(
        self, 
        chat_id: str | int, 
        text: str,
        disable_notification: bool = False
    ) -> bool:
        if not self.bot_token:
            logger.warning("BOT_TOKEN not configured, skipping Telegram message")
            return False

        url = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "HTML",
            "disable_notification": disable_notification
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as response:
                    if response.status == 200:
                        logger.info(
                            "telegram_message_sent",
                            chat_id=str(chat_id),
                            message_length=len(text)
                        )
                        return True
                    else:
                        error_data = await response.json()
                        logger.error(
                            "telegram_message_failed",
                            chat_id=str(chat_id),
                            status=response.status,
                            error=error_data
                        )
                        return False
        except Exception as e:
            logger.error(
                "telegram_message_error",
                chat_id=str(chat_id),
                error=str(e),
                exc_info=True
            )
            return False

    async def send_payment_notification_to_admin(self, order: Order) -> None:
        if not self.admin_chat_id:
            logger.warning("ADMIN_CHAT_ID not configured, skipping payment notification")
            return

        payment = order.payment
        if not payment:
            logger.warning("payment_not_found_for_notification", order_id=str(order.id))
            return  

        delivery_info = ""
        if order.is_pickup_by_customer:
            delivery_info = "🏪 <b>Самовывоз</b>"
        else:
            address_parts = []
            if order.delivery_city:
                address_parts.append(order.delivery_city)
            if order.delivery_street:
                address_parts.append(f"ул. {order.delivery_street}")
            if order.delivery_house:
                address_parts.append(f"д. {order.delivery_house}")
            if order.delivery_apartment:
                address_parts.append(f"кв. {order.delivery_apartment}")
            if order.delivery_floor:
                address_parts.append(f"этаж {order.delivery_floor}")
            
            delivery_info = (
                f"🚚 <b>Доставка</b>\n"
                f"📍 <b>Адрес:</b> {', '.join(address_parts) if address_parts else 'Не указан'}\n"
                f"📅 <b>Дата доставки:</b> {order.delivery_date.strftime('%d.%m.%Y')}\n"
                f"⏰ <b>Время:</b> {order.delivery_time_from.strftime('%H:%M')} - {order.delivery_time_to.strftime('%H:%M')}"
            )

        items_text = "\n".join([
            f"  • {item.bouquet.name if hasattr(item, 'bouquet') and item.bouquet else 'Букет'} x{item.quantity} - {item.price * item.quantity} ₽"
            for item in order.items
        ])

        message_text = (
            f"💳 <b>Новый оплаченный заказ #{order.id}</b>\n\n"
            f"👤 <b>Покупатель:</b> {order.customer_name}\n"
            f"📞 <b>Телефон:</b> {order.customer_phone}\n"
            f"📧 <b>Email:</b> {order.customer_email}\n\n"
            f"🎁 <b>Получатель:</b> {order.recipient_name}\n"
            f"📞 <b>Телефон получателя:</b> {order.recipient_phone}\n\n"
            f"{delivery_info}\n\n"
            f"🛍️ <b>Состав заказа:</b>\n{items_text}\n\n"
            f"💰 <b>Сумма:</b> {payment.amount} ₽\n"
            f"📊 <b>Статус платежа:</b> {self.status_messages.get(payment.status)}\n"
        )

        if payment.transaction_id:
            message_text += f"🔢 <b>ID транзакции:</b> {payment.transaction_id}\n"
        if payment.payment_date:
            message_text += f"📅 <b>Дата оплаты:</b> {payment.payment_date.strftime('%d.%m.%Y %H:%M')}\n"
        if order.greeting_card_text:
            message_text += f"\n💌 <b>Текст открытки:</b> {order.greeting_card_text}\n"
        if order.comment:
            message_text += f"\n💬 <b>Комментарий:</b> {order.comment}\n"

        success = await self.send_message(
            chat_id=self.admin_chat_id,
            text=message_text
        )

        if success:
            logger.info("payment_notification_sent_to_admin", order_id=str(order.id), payment_id=str(payment.id))
        else:
            logger.error("payment_notification_failed", order_id=str(order.id))

    async def send_order_status_change_to_admin(self, order: Order, old_status: str) -> None:
        if not self.admin_chat_id:
            logger.warning("ADMIN_CHAT_ID not configured, skipping status change notification")
            return

        message_text = (
            f"📊 <b>Изменение статуса заказа</b>\n\n"
            f"🆔 <b>Номер заказа:</b> #{order.id}\n"
            f"👤 <b>Покупатель:</b> {order.customer_name}\n"
            f"📧 <b>Email:</b> {order.customer_email}\n"
            f"📞 <b>Телефон:</b> {order.customer_phone}\n\n"
            f"📊 <b>Предыдущий статус:</b> {self.status_messages.get(old_status)}\n"
            f"📊 <b>Новый статус:</b> {self.status_messages.get(order.status.value)}\n"
        )

        success = await self.send_message(
            chat_id=self.admin_chat_id,
            text=message_text
        )

        if success:
            logger.info(
                "order_status_change_notification_sent_to_admin",
                order_id=str(order.id),
                old_status=old_status,
                new_status=order.status.value
            )
        else:
            logger.error("order_status_change_notification_failed", order_id=str(order.id))

