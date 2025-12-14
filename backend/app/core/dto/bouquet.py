from uuid import UUID
from pydantic import BaseModel, Field


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
    main_image: BouquetImageSchema | None = None


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


class BouquetFilterSchema(BaseModel):
    bouquet_type_ids: list[UUID] | None = Field(default=None, description="Список ID типов букетов")
    flower_type_ids: list[UUID] | None = Field(default=None, description="Список ID типов цветов")
    price_min: int | None = Field(default=None, ge=0, description="Минимальная цена")
    price_max: int | None = Field(default=None, ge=0, description="Максимальная цена")
    limit: int = Field(default=20, ge=1, le=100, description="Количество результатов")
    offset: int = Field(default=0, ge=0, description="Смещение для пагинации")


class BouquetCreateSchema(BaseModel):
    name: str
    description: str
    price: int
    bouquet_type_id: UUID
    flower_type_ids: list[UUID] | None = None


class BouquetUpdateSchema(BaseModel):
    name: str | None = None
    description: str | None = None
    price: int | None = None
    bouquet_type_id: UUID | None = None
    flower_type_ids: list[UUID] | None = None

