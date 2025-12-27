from typing import Annotated, AsyncGenerator

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

import app.core.repositories as repositories
import app.core.services as services
from app.core.dto.admin import BaseAdminSchema
from app.core import clients


token_scheme = HTTPBearer(auto_error=False)


async def get_db_session(
    request: Request,
) -> AsyncGenerator[AsyncSession, None]:
    session = await request.app.state.db_connection.get_session()
    try:
        yield session
    finally:
        await session.close()



async def get_smtp_client() -> clients.SMTPClients:
    return clients.SMTPClients()


async def get_telegram_client() -> clients.TelegramClient:
    return clients.TelegramClient()


async def get_image_service() -> services.ImageService:
    return services.ImageService()


async def get_bouquet_service(
    session=Depends(get_db_session),
    image_service: services.ImageService = Depends(get_image_service)
) -> services.BouquetService:
    return services.BouquetService(
        repository=repositories.BouquetRepository(session=session),
        image_service=image_service
    )


async def get_customer_service(session=Depends(get_db_session)) -> services.CustomerService:
    return services.CustomerService(
        repository=repositories.CustomerRepository(session=session)
    )


async def get_auth_service(session=Depends(get_db_session)) -> services.AuthService:
    return services.AuthService(
        repository=repositories.AdminRepository(session=session)
    )


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(token_scheme)],
    auth_service: Annotated[services.AuthService, Depends(get_auth_service)],
) -> BaseAdminSchema:
    token = credentials.credentials if credentials else None
    token_data = await auth_service.verify_token(token)
    return await auth_service.check_user_exist(token_data)


async def get_order_service(
    session=Depends(get_db_session),
    smtp_client=Depends(get_smtp_client),
    telegram_client=Depends(get_telegram_client)
) -> services.OrderService:
    return services.OrderService(
        repository=repositories.OrderRepository(session=session),
        smtp_client=smtp_client,
        telegram_client=telegram_client
    )