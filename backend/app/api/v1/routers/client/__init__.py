from fastapi import APIRouter


from app.api.v1.routers.client.bouquet import router as bouquet_router
from app.api.v1.routers.client.order import router as order_router
from app.api.v1.routers.client.customer import router as customer_router

api_v1_routers = APIRouter(prefix="/api/v1")
api_v1_routers.include_router(bouquet_router, prefix="/bouquet", tags=["bouquet"])
api_v1_routers.include_router(order_router, prefix="/order", tags=["order"])
api_v1_routers.include_router(customer_router, prefix="/customer", tags=["customer"])