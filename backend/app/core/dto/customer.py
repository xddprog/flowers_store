
from pydantic import BaseModel


class CustomerAdminSchema(BaseModel):
    email: str
    phone: str
    name: str | None = None
    is_blocked: bool