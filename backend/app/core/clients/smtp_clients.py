from fastapi_mail import ConnectionConfig, FastMail, MessageSchema

from app.infrastructure.config.config import SMTP_CONFIG
from app.infrastructure.logging.logger import get_logger
from app.infrastructure.database.models.order import Order

logger = get_logger(__name__)


class SMTPClients:
    def __init__(self):
        self.smtp_client = FastMail(self.create_smtp_config())

    def create_smtp_config(self):
        return ConnectionConfig(
            MAIL_USERNAME=SMTP_CONFIG.SMTP_USER,
            MAIL_PASSWORD=SMTP_CONFIG.SMTP_PASSWORD,
            MAIL_PORT=SMTP_CONFIG.SMTP_PORT,
            MAIL_SERVER=SMTP_CONFIG.SMTP_HOST,
            MAIL_STARTTLS=True, 
            MAIL_SSL_TLS=False, 
            MAIL_FROM=SMTP_CONFIG.SMTP_USER,
            SUPPRESS_SEND=0,
            TIMEOUT=10
        )
    
    async def send_order_confirmation(self, order: Order) -> None:
        try:
            delivery_info = ""
            if order.is_pickup_by_customer:
                delivery_info = "<p><strong>Способ получения:</strong> Самовывоз</p>"
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
                    f"<p><strong>Способ получения:</strong> Доставка</p>"
                    f"<p><strong>Адрес доставки:</strong> {', '.join(address_parts)}</p>"
                    f"<p><strong>Дата доставки:</strong> {order.delivery_date.strftime('%d.%m.%Y')}</p>"
                    f"<p><strong>Время доставки:</strong> {order.delivery_time_from.strftime('%H:%M')} - {order.delivery_time_to.strftime('%H:%M')}</p>"
                )

            items_html = "<ul>"
            for item in order.items:
                bouquet_name = item.bouquet.name if hasattr(item, 'bouquet') and item.bouquet else 'Букет'
                items_html += f"<li>{bouquet_name} x{item.quantity} - {item.price * item.quantity} ₽</li>"
            items_html += "</ul>"

            payment_method = order.payments[0].payment_method.value if order.payments else 'Не указан'

            email_body = f"""
            <html>
            <body>
                <h2>Спасибо за ваш заказ!</h2>
                <p>Здравствуйте, {order.customer_name}!</p>
                <p>Ваш заказ #{order.id} успешно оформлен.</p>
                
                <h3>Детали заказа:</h3>
                <p><strong>Получатель:</strong> {order.recipient_name}</p>
                <p><strong>Телефон получателя:</strong> {order.recipient_phone}</p>
                {delivery_info}
                
                <h3>Состав заказа:</h3>
                {items_html}
                
                <p><strong>Общая сумма:</strong> {order.total_amount} ₽</p>
                <p><strong>Способ оплаты:</strong> {payment_method}</p>
                <p><strong>Статус заказа:</strong> {order.status.value}</p>
            """

            if order.greeting_card_text:
                email_body += f"<p><strong>Текст открытки:</strong> {order.greeting_card_text}</p>"

            if order.comment:
                email_body += f"<p><strong>Комментарий:</strong> {order.comment}</p>"

            email_body += """
                <p>Мы свяжемся с вами в ближайшее время для подтверждения заказа.</p>
                <p>С уважением,<br>Команда магазина цветов</p>
            </body>
            </html>
            """

            message = MessageSchema(
                subject=f"Подтверждение заказа #{order.id}",
                recipients=[order.customer_email],
                body=email_body,
                subtype="html"
            )
            
            await self.smtp_client.send_message(message)
            logger.info("order_confirmation_email_sent", order_id=str(order.id), email=order.customer_email)
            
        except Exception as e:
            logger.error(
                "order_confirmation_email_failed",
                order_id=str(order.id),
                email=order.customer_email,
                error=str(e),
                exc_info=True
            )

    async def send_order_status_change(self, order: Order, old_status: str) -> None:
        """Отправляет письмо покупателю об изменении статуса заказа"""
        try:
            status_messages = {
                "paid": "Ваш заказ оплачен",
                "processing": "Ваш заказ обрабатывается",
                "completed": "Ваш заказ выполнен",
                "cancelled": "Ваш заказ отменен"
            }

            status_message = status_messages.get(order.status.value, "Статус вашего заказа изменен")

            email_body = f"""
            <html>
            <body>
                <h2>Обновление статуса заказа</h2>
                <p>Здравствуйте, {order.customer_name}!</p>
                <p>Статус вашего заказа #{order.id} изменен:</p>
                <p><strong>Предыдущий статус:</strong> {old_status}</p>
                <p><strong>Новый статус:</strong> {order.status.value}</p>
                <p><strong>{status_message}</strong></p>
                <p>С уважением,<br>Команда магазина цветов</p>
            </body>
            </html>
            """

            message = MessageSchema(
                subject=f"Обновление статуса заказа #{order.id}",
                recipients=[order.customer_email],
                body=email_body,
                subtype="html"
            )
            
            await self.smtp_client.send_message(message)
            logger.info(
                "order_status_change_email_sent",
                order_id=str(order.id),
                email=order.customer_email,
                old_status=old_status,
                new_status=order.status.value
            )
            
        except Exception as e:
            logger.error(
                "order_status_change_email_failed",
                order_id=str(order.id),
                email=order.customer_email,
                error=str(e),
                exc_info=True
            )
