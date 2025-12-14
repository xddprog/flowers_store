from fastapi import APIRouter

from app.api.v1.routers.admin.bouquet import router as bouquet_router
from app.api.v1.routers.admin.order import router as order_router
from app.api.v1.routers.admin.customer import router as customer_router

api_v1_routers = APIRouter(prefix="/admin")
api_v1_routers.include_router(bouquet_router, prefix="/bouquet", tags=["admin-bouquet"])
api_v1_routers.include_router(order_router, prefix="/order", tags=["admin-order"])
api_v1_routers.include_router(customer_router, prefix="/customer", tags=["admin-customer"])