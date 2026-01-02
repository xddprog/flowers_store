
from uuid import UUID
from pydantic import BaseModel


class FlowerTypeSchema(BaseModel):
    id: UUID
    name: str
    bouquets_count: int