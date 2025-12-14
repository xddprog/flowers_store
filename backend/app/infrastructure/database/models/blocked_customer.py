from sqlalchemy.orm import Mapped, mapped_column
from app.infrastructure.database.models.base import Base


class BlockedCustomer(Base):
    __tablename__ = "blocked_customers"
    
    email: Mapped[str]
    phone: Mapped[str | None] = mapped_column(default=None)
