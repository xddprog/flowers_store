
from pydantic import BaseModel, Field


class CustomerAdminSchema(BaseModel):
    email: str = Field(validation_alias="customer_email")
    phone: str = Field(validation_alias="customer_phone")
    name: str | None = None
    is_blocked: bool