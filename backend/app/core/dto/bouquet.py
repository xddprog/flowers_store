from uuid import UUID
from pydantic import BaseModel


class BouquetImageSchema(BaseModel):
    id: UUID
    image_path: str
    order: int


class FlowerTypeSchema(BaseModel):
    id: UUID
    name: str


class BouquetTypeSchema(BaseModel):
    id: UUID
    name: str


class BaseBouquetSchema(BaseModel):
    id: UUID
    name: str
    price: int
    main_image: str | None = None


class BouquetDetailSchema(BaseModel):
    id: UUID
    name: str
    description: str
    price: int
    quantity: int
    purchase_count: int
    view_count: int
    bouquet_type: BouquetTypeSchema
    flower_types: list[FlowerTypeSchema]
    images: list[BouquetImageSchema]