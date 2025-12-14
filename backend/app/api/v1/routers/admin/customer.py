from typing import Annotated
from fastapi import APIRouter, Depends

from app.api.v1.dependencies import get_customer_service
from app.core.dto.customer import CustomerAdminSchema
from app.core.services.customer_service import CustomerService


router = APIRouter()


@router.get("/", response_model=list[CustomerAdminSchema])
async def get_all_customers(
    service: Annotated[CustomerService, Depends(get_customer_service)],
    limit: int = 10,
    offset: int = 0
) -> list[CustomerAdminSchema]:
    return await service.get_all_customers(limit, offset)


@router.post("/{email}/block")
async def block_customer(
    service: Annotated[CustomerService, Depends(get_customer_service)],
    email: str,
    phone: str | None = None,
) -> dict:
    await service.block_customer(email, phone)
    return {"message": "Покупатель заблокирован"}


@router.post("/{email}/unblock")
async def unblock_customer(
    email: str,
    service: Annotated[CustomerService, Depends(get_customer_service)]
) -> dict:
    await service.unblock_customer(email)
    return {"message": "Покупатель разблокирован"}

