from app.infrastructure.errors.base import NotFoundException
from app.core.dto.customer import CustomerAdminSchema
from app.core.repositories.customer_repository import CustomerRepository


class CustomerService:
    def __init__(self, repository: CustomerRepository):
        self.repository = repository

    async def get_all_customers(self, limit: int, offset: int) -> list[CustomerAdminSchema]:
        customers = await self.repository.get_all_items(limit, offset)
        return [CustomerAdminSchema(**c) for c in customers]

    async def block_customer(self, email: str, phone: str | None = None) -> None:
        await self.repository.add_item(email=email, phone=phone)

    async def unblock_customer(self, email: str) -> None:
        item = await self.repository.get_by_filter(email=email)
        if not item:
            raise NotFoundException(f"Пользователь с email {email} не найден")
        await self.repository.delete_item(item)

    async def is_blocked(self, email: str, phone: str | None = None) -> bool:
        filters = {}
        if email:
            filters["email"] = email
        if phone:
            filters["phone"] = phone
        items = await self.repository.get_by_filter(**filters)
        return items is not None

