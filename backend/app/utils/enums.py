from enum import Enum


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"


class DeliveryMethod(str, Enum):
    DELIVERY = "delivery"
    PICKUP = "pickup"


class OrderStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    PROCESSING = "processing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class BouquetSort(str, Enum):
    POPULAR = "popular"
    PRICE_ASC = "price_asc"
    PRICE_DESC = "price_desc"