from fastapi import APIRouter


from app.api.v1.routers.auth import router as auth_router
from app.api.v1.routers.user import router as user_router
from app.api.v1.routers.bouquet import router as bouquet_router

api_v1_routers = APIRouter(prefix="/api/v1")
api_v1_routers.include_router(auth_router, prefix="/auth", tags=["auth"])
api_v1_routers.include_router(user_router, prefix="/user", tags=["user"])
api_v1_routers.include_router(bouquet_router, prefix="/bouquet", tags=["bouquet"])