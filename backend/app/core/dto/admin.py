from pydantic import BaseModel
from uuid import UUID


class BaseAdminSchema(BaseModel):
    id: UUID
    username: str

