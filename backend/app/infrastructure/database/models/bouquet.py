from uuid import UUID
from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.infrastructure.database.models.base import Base


class BouquetFlowerType(Base):
    """Промежуточная таблица для связи many-to-many между букетами и типами цветов"""
    __tablename__ = "bouquet_flower_types"
    __table_args__ = (
        UniqueConstraint("bouquet_id", "flower_type_id", name="uq_bouquet_flower_type"),
    )
    
    bouquet_id: Mapped[UUID] = mapped_column(
        ForeignKey("bouquets.id", ondelete="CASCADE"),
        primary_key=True
    )
    flower_type_id: Mapped[UUID] = mapped_column(
        ForeignKey("flower_types.id", ondelete="CASCADE"),
        primary_key=True
    )


class Bouquet(Base):
    __tablename__ = "bouquets"
    
    name: Mapped[str]
    description: Mapped[str]
    price: Mapped[int]
    quantity: Mapped[int] = mapped_column(default=0)
    purchase_count: Mapped[int] = mapped_column(default=0)
    view_count: Mapped[int] = mapped_column(default=0)
    bouquet_type_id: Mapped[UUID] = mapped_column(ForeignKey("bouquet_types.id"))

    images: Mapped[list["BouquetImage"]] = relationship(
        back_populates="bouquet",
        cascade="all, delete-orphan",
        order_by="BouquetImage.order"
    )
    bouquet_type: Mapped["BouquetType"] = relationship(back_populates="bouquets")
    flower_types: Mapped[list["FlowerType"]] = relationship(
        secondary="bouquet_flower_types",
        back_populates="bouquets"
    )


class BouquetImage(Base):
    __tablename__ = "bouquet_images"

    image_path: Mapped[str]
    order: Mapped[int] = mapped_column(default=0)
    
    bouquet_id: Mapped[UUID] = mapped_column(ForeignKey("bouquets.id", ondelete="CASCADE"))
    bouquet: Mapped["Bouquet"] = relationship(back_populates="images")


class BouquetType(Base):
    __tablename__ = "bouquet_types"

    name: Mapped[str]
    bouquets: Mapped[list["Bouquet"]] = relationship(back_populates="bouquet_type")


class FlowerType(Base):
    __tablename__ = "flower_types"

    name: Mapped[str]
    bouquets: Mapped[list["Bouquet"]] = relationship(
        secondary="bouquet_flower_types",
        back_populates="flower_types"
    )