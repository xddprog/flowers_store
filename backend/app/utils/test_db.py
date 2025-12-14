from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.models.bouquet import Bouquet, BouquetType, FlowerType, BouquetImage, BouquetFlowerType
from app.infrastructure.logging.logger import get_logger


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
        
        # Создаем тестовые букеты
        test_bouquets = [
            {
                "name": "Романтический букет из роз",
                "description": "Красивый букет из красных роз, идеально подходит для выражения чувств",
                "price": 3500,
                "quantity": 10,
                "bouquet_type": "Монобукет",
                "flower_types": ["Розы"],
                "images": ["/static/bouquets/rose_bouquet_1.jpg"]
            },
            {
                "name": "Весенний букет тюльпанов",
                "description": "Свежий букет из разноцветных тюльпанов, символ весны и обновления",
                "price": 2500,
                "quantity": 15,
                "bouquet_type": "Монобукет",
                "flower_types": ["Тюльпаны"],
                "images": ["/static/bouquets/tulip_bouquet_1.jpg"]
            },
            {
                "name": "Свадебный букет невесты",
                "description": "Элегантный свадебный букет из белых роз и пионов",
                "price": 5500,
                "quantity": 5,
                "bouquet_type": "Свадебный букет",
                "flower_types": ["Розы", "Пионы"],
                "images": ["/static/bouquets/wedding_bouquet_1.jpg"]
            },
            {
                "name": "Букет в коробке",
                "description": "Стильный букет из роз и эвкалипта в красивой коробке",
                "price": 4500,
                "quantity": 8,
                "bouquet_type": "Букет в коробке",
                "flower_types": ["Розы", "Эвкалипт"],
                "images": ["/static/bouquets/box_bouquet_1.jpg"]
            },
            {
                "name": "Композиция из хризантем",
                "description": "Яркая композиция из разноцветных хризантем",
                "price": 2800,
                "quantity": 12,
                "bouquet_type": "Композиция",
                "flower_types": ["Хризантемы"],
                "images": ["/static/bouquets/chrysanthemum_composition_1.jpg"]
            },
            {
                "name": "Авторский букет",
                "description": "Уникальный авторский букет из лилий, ирисов и гипсофилы",
                "price": 4200,
                "quantity": 6,
                "bouquet_type": "Авторский букет",
                "flower_types": ["Лилии", "Ирисы", "Гипсофила"],
                "images": ["/static/bouquets/author_bouquet_1.jpg"]
            },
            {
                "name": "Цветочная корзина",
                "description": "Пышная корзина из гербер, альстромерий и зелени",
                "price": 3800,
                "quantity": 7,
                "bouquet_type": "Цветочная корзина",
                "flower_types": ["Герберы", "Альстромерии"],
                "images": ["/static/bouquets/basket_1.jpg"]
            },
            {
                "name": "Каскадный букет",
                "description": "Элегантный каскадный букет из орхидей и фрезий",
                "price": 6000,
                "quantity": 4,
                "bouquet_type": "Каскадный букет",
                "flower_types": ["Орхидеи", "Фрезии"],
                "images": ["/static/bouquets/cascade_bouquet_1.jpg"]
            },
        ]
        
        # Создаем букеты
        for bouquet_data in test_bouquets:
            # Находим тип букета
            bouquet_type = next((bt for bt in bouquet_types_list if bt.name == bouquet_data["bouquet_type"]), None)
            if not bouquet_type:
                continue
            
            # Создаем букет
            bouquet = Bouquet(
                name=bouquet_data["name"],
                description=bouquet_data["description"],
                price=bouquet_data["price"],
                quantity=bouquet_data["quantity"],
                bouquet_type_id=bouquet_type.id,
                is_active=True
            )
            session.add(bouquet)
            await session.flush()
            
            # Добавляем типы цветов
            for flower_type_name in bouquet_data["flower_types"]:
                flower_type = next((ft for ft in flower_types_list if ft.name == flower_type_name), None)
                if flower_type:
                    bouquet_flower_type = BouquetFlowerType(
                        bouquet_id=bouquet.id,
                        flower_type_id=flower_type.id
                    )
                    session.add(bouquet_flower_type)
            
            # Добавляем изображения
            for idx, image_path in enumerate(bouquet_data["images"]):
                bouquet_image = BouquetImage(
                    bouquet_id=bouquet.id,
                    image_path=image_path,
                    order=idx
                )
                session.add(bouquet_image)
        
        await session.commit()
        logger.info("test_data_initialized", 
                   flower_types_count=len(FLOWER_TYPES),
                   bouquet_types_count=len(BOUQUET_TYPES),
                   bouquets_count=len(test_bouquets))
    except Exception as e:
        await session.rollback()
        logger.error("test_data_initialization_failed", error=str(e), exc_info=True)
        raise
