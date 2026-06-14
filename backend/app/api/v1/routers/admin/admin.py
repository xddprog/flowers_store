from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends

from app.api.v1.dependencies import get_auth_service, get_current_user
from app.core.dto.admin import AdminCreateSchema, AdminUpdateSchema, BaseAdminSchema
from app.core.services.auth_service import AuthService
from app.infrastructure.errors.base import BadRequestException, NotFoundException
from app.utils.error_extra import error_response


router = APIRouter()


@router.get("/")
async def get_all_admins(
    service: Annotated[AuthService, Depends(get_auth_service)],
    limit: int = 100,
    offset: int = 0,
) -> list[BaseAdminSchema]:
    return await service.get_all_admins(limit, offset)


@router.post(
    "/",
    responses={**error_response(BadRequestException)},
)
async def create_admin(
    data: AdminCreateSchema,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> BaseAdminSchema:
    return await service.create_admin(data)


@router.put(
    "/{admin_id}",
    responses={**error_response(NotFoundException), **error_response(BadRequestException)},
)
async def update_admin(
    admin_id: UUID,
    data: AdminUpdateSchema,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> BaseAdminSchema:
    return await service.update_admin(admin_id, data)


@router.delete(
    "/{admin_id}",
    responses={**error_response(NotFoundException), **error_response(BadRequestException)},
)
async def delete_admin(
    admin_id: UUID,
    service: Annotated[AuthService, Depends(get_auth_service)],
    current_user: Annotated[BaseAdminSchema, Depends(get_current_user)],
) -> None:
    await service.delete_admin(admin_id, current_user.id)
