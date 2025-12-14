from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends

from app.api.v1.dependencies import get_order_service
from app.core.dto.order import OrderAdminSchema, OrderStatusUpdateSchema
from app.core.services.order_service import OrderService
from app.infrastructure.errors.base import NotFoundException
from app.utils.error_extra import error_response


router = APIRouter()


@router.get("/", response_model=list[OrderAdminSchema])
async def get_all_orders(
    limit: int = 10,
    offset: int = 0,
    service: Annotated[OrderService, Depends(get_order_service)] = None
) -> list[OrderAdminSchema]:
    return await service.get_all_orders(limit, offset)


@router.patch("/{order_id}/status", response_model=OrderAdminSchema, responses={**error_response(NotFoundException)})
async def update_order_status(
    order_id: UUID,
    data: OrderStatusUpdateSchema,
    service: Annotated[OrderService, Depends(get_order_service)] = None
) -> OrderAdminSchema:
    return await service.update_order_status(order_id, data)


@router.delete("/{order_id}", responses={**error_response(NotFoundException)})
async def delete_order(
    order_id: UUID,
    service: Annotated[OrderService, Depends(get_order_service)] = None
) -> None:
    await service.delete_order(order_id)


@router.post("/{order_id}/archive", response_model=OrderAdminSchema, responses={**error_response(NotFoundException)})
async def archive_order(
    order_id: UUID,
    service: Annotated[OrderService, Depends(get_order_service)] = None
) -> OrderAdminSchema:
    return await service.archive_order(order_id)

