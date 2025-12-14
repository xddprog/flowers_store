from sqlalchemy import or_, select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.repositories.base import SqlAlchemyRepository
from app.infrastructure.database.models.order import Order
from app.infrastructure.database.models.blocked_customer import BlockedCustomer


class CustomerRepository(SqlAlchemyRepository[BlockedCustomer]):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all_items(self, limit: int, offset: int) -> list[dict]:
        blocked_exists = (
            select(1)
            .where(
                BlockedCustomer.email == Order.customer_email,
                BlockedCustomer.phone == Order.customer_phone
            )
            .exists()
        )
        query = select(
            Order.customer_email,
            Order.customer_phone,
            func.max(Order.customer_name).label("name"),
            blocked_exists.label("is_blocked")
        ).group_by(Order.customer_email, Order.customer_phone)
        
        result = await self.session.execute(query)
        return result.mappings().all()
