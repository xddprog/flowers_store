from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, BackgroundTasks, Depends, Request

from app.api.v1.dependencies import get_bouquet_service, get_order_service
from app.core.dto.order import OrderCreateSchema, OrderResponseSchema
from app.core.services.order_service import OrderService
from app.core.services.bouquet_service import BouquetService


router = APIRouter()


@router.post("/")
async def create_order(
    order_data: OrderCreateSchema,
    order_service: Annotated[OrderService, Depends(get_order_service)],
    bouquet_service: Annotated[BouquetService, Depends(get_bouquet_service)],
    background_tasks: BackgroundTasks,
) -> OrderResponseSchema:
    cart_items = await bouquet_service.get_bouquets_to_order(order_data.items)
    return await order_service.create_order(order_data, cart_items, background_tasks)


@router.post("/v1/webhook")
async def webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    order_service: Annotated[OrderService, Depends(get_order_service)],
):
    return await order_service.update_order_status_webhook(request, background_tasks)
