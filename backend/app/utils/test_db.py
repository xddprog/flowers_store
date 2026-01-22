from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.models.bouquet import BouquetType, FlowerType
from app.infrastructure.database.models.admin import Admin
from app.infrastructure.logging.logger import get_logger
from passlib.context import CryptContext


logger = get_logger(__name__)


FLOWER_TYPES = [
    "Розы",
    "Тюльпаны",
    "Хризантемы",
    "Герберы",
    "Альстромерии",
    "Лилии",
    "Гвоздики",
    "Эустома",
    "Анемоны",
    "Лютики",
    "Фрезии",
    "Ирисы",
    "Нарциссы",
    "Подсолнухи",
    "Орхидеи",
    "Гортензии",
    "Пионы",
    "Астры",
    "Гипсофила",
    "Статица",
    "Эвкалипт",
    "Лаванда",
    "Гладиолусы",
]

BOUQUET_TYPES = [
    "Цветы",
    "Монобукет",
    "Композиция",
    "Авторский букет",
    "Декор",
    "Букет в коробке",
    "Цветочная корзина",
    "Свадебный букет",
    "Каскадный букет",
]


async def init_test_db(session: AsyncSession) -> None:
    try:
        # Проверяем, есть ли уже данные
        existing_flower_types = await session.execute(select(FlowerType))
        if existing_flower_types.scalars().first():
            logger.info("test_data_already_exists")
            return
        
        # Создаем типы цветов
        flower_types = [FlowerType(name=name) for name in FLOWER_TYPES]
        session.add_all(flower_types)
        
        # Создаем типы букетов
        bouquet_types = [BouquetType(name=name) for name in BOUQUET_TYPES]
        session.add_all(bouquet_types)
        
        await session.flush()
        
        # Получаем созданные типы для использования
        flower_types_result = await session.execute(select(FlowerType))
        flower_types_list = list(flower_types_result.scalars().all())
        
        bouquet_types_result = await session.execute(select(BouquetType))
        bouquet_types_list = list(bouquet_types_result.scalars().all())
        
        # Импортируем букеты с lascovo.ru
        from scripts.parse_lascovo import (
            LascovoParser,
            build_bouquet_keyword_list,
            build_flower_keyword_map,
            PLAYWRIGHT_AVAILABLE,
        )

        default_bouquet_type_id = bouquet_types_list[0].id
        async with LascovoParser(session, use_playwright=PLAYWRIGHT_AVAILABLE) as parser:
            parser.bouquet_type_keywords = build_bouquet_keyword_list(bouquet_types_list)
            parser.flower_type_keywords = build_flower_keyword_map(flower_types_list)
            bouquets = await parser.parse_catalog_page(parser.BASE_URL, debug=False)
            for bouquet_data in bouquets:
                await parser.create_bouquet_from_data(
                    bouquet_data,
                    default_bouquet_type_id=default_bouquet_type_id
                )

        await session.commit()
        logger.info(
            "test_data_initialized",
            flower_types_count=len(FLOWER_TYPES),
            bouquet_types_count=len(BOUQUET_TYPES),
            bouquets_count=len(bouquets)
        )

        pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
        admin = Admin(
            username="admin",
            password_hash=pwd_context.hash("admin")
        )
        session.add(admin)
        await session.commit()
    except Exception as e:
        await session.rollback()
        logger.error("test_data_initialization_failed", error=str(e), exc_info=True)
        raise
