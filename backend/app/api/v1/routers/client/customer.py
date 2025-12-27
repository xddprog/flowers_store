from typing import Annotated
from fastapi import APIRouter, Depends

from app.api.v1.dependencies import get_customer_service
from app.core.services.customer_service import CustomerService


router = APIRouter()


@router.get("/is_blocked")
async def is_blocked(
    service: Annotated[CustomerService, Depends(get_customer_service)],
    email: str,
    phone: str | None = None,
) -> bool:
    return await service.is_blocked(email, phone)