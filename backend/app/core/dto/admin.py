from pydantic import BaseModel, Field
from uuid import UUID


class BaseAdminSchema(BaseModel):
    id: UUID
    username: str


class AdminCreateSchema(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=6)


class AdminUpdateSchema(BaseModel):
    username: str | None = Field(default=None, min_length=1)
    password: str | None = Field(default=None, min_length=6)

