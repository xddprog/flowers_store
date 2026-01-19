from typing import TYPE_CHECKING
from uuid import UUID
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.infrastructure.database.models.base import Base

from app.utils.enums import DeliveryMethod, OrderStatus, PaymentStatus


if TYPE_CHECKING:
    from app.infrastructure.database.models.bouquet import Bouquet


class Order(Base):
    __tablename__ = "orders"
    
    customer_name: Mapped[str]
    customer_phone: Mapped[str]
    customer_email: Mapped[str]
    is_pickup_by_customer: Mapped[bool] = mapped_column(default=False)
    
    recipient_name: Mapped[str] = mapped_column(nullable=True)
    recipient_phone: Mapped[str] = mapped_column(nullable=True)
    greeting_card_text: Mapped[str | None] = mapped_column(default=None)
    
    delivery_method: Mapped[DeliveryMethod] = mapped_column(SQLEnum(DeliveryMethod))
    delivery_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    delivery_time_from: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    delivery_time_to: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    
    delivery_city: Mapped[str | None] = mapped_column(default=None)
    delivery_street: Mapped[str | None] = mapped_column(default=None)
    delivery_house: Mapped[str | None] = mapped_column(default=None)
    delivery_apartment: Mapped[str | None] = mapped_column(default=None)
    delivery_floor: Mapped[str | None] = mapped_column(default=None)
    
    comment: Mapped[str | None] = mapped_column(default=None)
    total_amount: Mapped[int]
    status: Mapped[OrderStatus] = mapped_column(SQLEnum(OrderStatus), default=OrderStatus.PENDING)
    is_active: Mapped[bool] = mapped_column(default=False)
    
    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order",
        cascade="all, delete-orphan"
    )
    payment: Mapped["Payment"] = relationship(
        back_populates="order",
        cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"
    
    order_id: Mapped[UUID] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"))
    bouquet_id: Mapped[UUID] = mapped_column(ForeignKey("bouquets.id", ondelete="CASCADE"))
    
    quantity: Mapped[int]
    price: Mapped[int]
    
    order: Mapped["Order"] = relationship(back_populates="items")
    bouquet: Mapped["Bouquet"] = relationship()



class Payment(Base):
    __tablename__ = "payments"
    
    order_id: Mapped[UUID] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"))
    
    amount: Mapped[int]
    status: Mapped[PaymentStatus] = mapped_column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING)
    transaction_id: Mapped[str | None] = mapped_column(default=None)
    payment_date: Mapped[datetime | None] = mapped_column(default=None)
    
    order: Mapped["Order"] = relationship(back_populates="payment")

