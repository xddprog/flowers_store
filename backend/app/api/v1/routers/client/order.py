from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, BackgroundTasks, Depends, Request

from app.api.v1.dependencies import get_order_service
from app.core.dto.order import OrderCreateSchema, OrderResponseSchema
from app.core.services.order_service import OrderService


router = APIRouter()


@router.post("/")
async def create_order(
    order_data: OrderCreateSchema,
    order_service: Annotated[OrderService, Depends(get_order_service)],
    background_tasks: BackgroundTasks,
) -> OrderResponseSchema:
    return await order_service.create_order(order_data, background_tasks)

