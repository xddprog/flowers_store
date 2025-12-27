from fastapi import APIRouter, Depends

from app.api.v1.routers.admin.auth import router as auth_router
from app.api.v1.routers.admin.bouquet import router as bouquet_router
from app.api.v1.routers.admin.order import router as order_router
from app.api.v1.routers.admin.customer import router as customer_router
from app.api.v1.dependencies import get_current_user


api_v1_routers = APIRouter(prefix="/admin")
PROTECTED = Depends(get_current_user)


api_v1_routers.include_router(auth_router, prefix="/auth", tags=["admin-auth"])
api_v1_routers.include_router(bouquet_router, prefix="/bouquet", tags=["admin-bouquet"], dependencies=[PROTECTED])
api_v1_routers.include_router(order_router, prefix="/order", tags=["admin-order"], dependencies=[PROTECTED])
api_v1_routers.include_router(customer_router, prefix="/customer", tags=["admin-customer"], dependencies=[PROTECTED])