from typing import Annotated
from fastapi import APIRouter, Depends

from app.api.v1.dependencies import get_order_service
from app.core.dto.order import OrderCreateSchema, OrderResponseSchema
from app.core.services.order_service import OrderService


router = APIRouter()


@router.post("/")
async def create_order(
    order_data: OrderCreateSchema,
    order_service: Annotated[OrderService, Depends(get_order_service)] = None
) -> OrderResponseSchema:
    return await order_service.create_order(order_data)

