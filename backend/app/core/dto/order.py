from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field
from app.utils.enums import DeliveryMethod, OrderStatus, PaymentMethod


class OrderItemCreateSchema(BaseModel):
    bouquet_id: UUID
    quantity: int = Field(ge=1)
    price: int = Field(ge=0)


class OrderCreateSchema(BaseModel):
    customer_name: str
    customer_phone: str
    customer_email: str
    is_pickup_by_customer: bool = False
    
    recipient_name: str
    recipient_phone: str
    greeting_card_text: str | None = None
    
    delivery_method: DeliveryMethod
    delivery_date: datetime
    delivery_time_from: datetime
    delivery_time_to: datetime
    
    delivery_city: str | None = None
    delivery_street: str | None = None
    delivery_house: str | None = None
    delivery_apartment: str | None = None
    delivery_floor: str | None = None
    
    comment: str | None = None
    
    items: list[OrderItemCreateSchema] = Field(min_length=1)
    
    payment_method: PaymentMethod
    payment_amount: int = Field(ge=0)


class OrderResponseSchema(BaseModel):
    id: UUID
    customer_name: str
    customer_phone: str
    customer_email: str
    total_amount: int
    status: str

class OrderAdminSchema(BaseModel):
    id: UUID
    customer_email: str
    customer_phone: str
    recipient_name: str
    recipient_phone: str | None = None
    delivery_city: str | None = None
    delivery_street: str | None = None
    delivery_house: str | None = None
    delivery_apartment: str | None = None
    delivery_floor: str | None = None
    total_amount: int
    status: str
    is_active: bool
    created_at: datetime



class OrderStatusUpdateSchema(BaseModel):
    status: OrderStatus
