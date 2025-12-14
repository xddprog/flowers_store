from typing import Annotated, AsyncGenerator

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession


import app.core.repositories as repositories
import app.core.services as services


token_scheme = HTTPBearer(auto_error=False)


async def get_db_session(
    request: Request,
) -> AsyncGenerator[AsyncSession, None]:
    session = await request.app.state.db_connection.get_session()
    try:
        yield session
    finally:
        await session.close()


async def get_bouquet_service(session=Depends(get_db_session)) -> services.BouquetService:
    return services.BouquetService(
        repository=repositories.BouquetRepository(session=session)
    )


async def get_order_service(session=Depends(get_db_session)) -> services.OrderService:
    return services.OrderService(
        repository=repositories.OrderRepository(session=session)
    )


async def get_customer_service(session=Depends(get_db_session)) -> services.CustomerService:
    return services.CustomerService(
        repository=repositories.CustomerRepository(session=session)
    )