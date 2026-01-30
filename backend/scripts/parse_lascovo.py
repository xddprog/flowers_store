"""
Парсер для импорта букетов с сайта lascovo.ru
"""
import asyncio
import argparse
import base64
import re
from io import BytesIO
from typing import Optional
from uuid import UUID

import aiohttp
from bs4 import BeautifulSoup
from fastapi import UploadFile

try:
    from playwright.async_api import async_playwright, Browser, Page
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("⚠️  Playwright не установлен. Для работы с JavaScript-сайтами установите: pip install playwright && playwright install")

from app.core.dto.bouquet import BouquetCreateSchema
from app.core.repositories.bouquet_repository import BouquetRepository
from app.core.repositories.flower_repository import FlowerRepository
from app.core.services.bouquet_service import BouquetService
from app.core.services.image_service import ImageService
from app.infrastructure.config.config import DB_CONFIG
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession


FLOWER_KEYWORD_STEMS: dict[str, list[str]] = {
    "роза": ["роз", "rose"],
    "гортензия": ["гортенз"],
    "пион": ["пион"],
    "ранункулюс": ["ранункул", "ранункулюс"],
    "эустома": ["эустом"],
    "диантус": ["диантус", "гвоздик"],
    "анемон": ["анемон"],
    "альстромерия": ["альстромер"],
    "магнолия": ["магноли"],
    "амарилис": ["амарил"],
    "антуриум": ["антуриум", "антурум"],
    "амарант": ["амарант"],
    "сирень": ["сирен"],
    "мимоза": ["мимоз"],
    "геоцинт": ["геоцинт", "гиацинт"],
    "тюльпан": ["тюльпан", "tulip"],
    "ромашка": ["ромашк"],
    "хризантема": ["хризантем"],
    "гербера": ["гербер"],
    "георгин": ["георгин", "далия", "dahlia"],
    "гладиолус": ["гладиол"],
    "калла": ["калл"],
    "лилия": ["лили", "лилия"],
    "подсолнух": ["подсолнух"],
}

BOUQUET_KEYWORD_STEMS: dict[str, list[str]] = {
    "монобукеты": ["монобукет", "моно"],
    "сезонные букеты": ["сезон", "сезонн"],
    "композиции корзины": ["композици", "корзин", "корзинка"],
    "авторские букеты": ["авторск", "автор"],
    "свадебные букеты": ["свадеб"],
    "вазы": ["ваз"],
    "горшечные растения": ["горшеч", "растен", "комнатн"],
    "искусственные цветы и сухоцветы": ["искусствен", "сухоцвет"],
}


def normalize_text(text: str) -> str:
    if not text:
        return ""
    normalized = text.lower().replace("ё", "е")
    normalized = re.sub(r"[^a-zа-я0-9\s]", " ", normalized)
    return re.sub(r"\s+", " ", normalized).strip()


def build_flower_keyword_map(flower_types: list) -> dict[UUID, list[str]]:
    keyword_map: dict[UUID, list[str]] = {}
    for flower_type in flower_types:
        name = normalize_text(flower_type.name)
        keywords = set()
        if name in FLOWER_KEYWORD_STEMS:
            keywords.update(FLOWER_KEYWORD_STEMS[name])
        if name:
            keywords.add(name)
            if len(name) > 3:
                keywords.add(name[:-1])
        keyword_map[flower_type.id] = sorted(keywords, key=len, reverse=True)
    return keyword_map


def build_bouquet_keyword_list(bouquet_types: list) -> list[tuple[UUID, list[str]]]:
    result: list[tuple[UUID, list[str]]] = []
    for bouquet_type in bouquet_types:
        name = normalize_text(bouquet_type.name)
        keywords = set()
        if name in BOUQUET_KEYWORD_STEMS:
            keywords.update(BOUQUET_KEYWORD_STEMS[name])
        if name:
            keywords.add(name)
            if len(name) > 3:
                keywords.add(name[:-1])
        result.append((bouquet_type.id, sorted(keywords, key=len, reverse=True)))
    return result


def detect_bouquet_type_id(
    text: str,
    bouquet_keywords: list[tuple[UUID, list[str]]],
    default_id: UUID
) -> UUID:
    for bouquet_type_id, keywords in bouquet_keywords:
        if any(keyword in text for keyword in keywords):
            return bouquet_type_id
    return default_id


def detect_flower_type_ids(
    text: str,
    flower_keywords: dict[UUID, list[str]]
) -> list[UUID]:
    matched: list[UUID] = []
    for flower_type_id, keywords in flower_keywords.items():
        if any(keyword in text for keyword in keywords):
            matched.append(flower_type_id)
    return matched


class LascovoParser:
    """Парсер для сайта lascovo.ru"""
    
    BASE_URL = "https://lascovo.ru"
    
    def __init__(self, session: AsyncSession, use_playwright: bool = False):
        self.session = session
        self.bouquet_service = BouquetService(
            repository=BouquetRepository(session),
            image_service=ImageService()
        )
        self.http_session: Optional[aiohttp.ClientSession] = None
        self.use_playwright = use_playwright and PLAYWRIGHT_AVAILABLE
        self.playwright = None
        self.browser: Optional[Browser] = None
        self.bouquet_type_keywords: list[tuple[UUID, list[str]]] = []
        self.flower_type_keywords: dict[UUID, list[str]] = {}
    
    async def __aenter__(self):
        if self.use_playwright:
            self.playwright = await async_playwright().start()
            self.browser = await self.playwright.chromium.launch(headless=True)
        else:
            self.http_session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=30),
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
            )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.http_session:
            await self.http_session.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
    
    async def fetch_page(self, url: str, wait_for_selector: Optional[str] = None) -> Optional[str]:
        """Получить HTML страницы"""
        try:
            if self.use_playwright:
                # Используем Playwright для рендеринга JavaScript
                page = await self.browser.new_page()
                try:
                    await page.goto(url, wait_until="networkidle", timeout=30000)
                    # Ждем загрузки контента
                    if wait_for_selector:
                        await page.wait_for_selector(wait_for_selector, timeout=10000)
                    else:
                        # Ждем появления любого контента (не только спиннера)
                        await page.wait_for_selector("app:not(:has(.app-loading))", timeout=10000, state="attached")
                    html = await page.content()
                    return html
                finally:
                    await page.close()
            else:
                # Обычный HTTP запрос
                async with self.http_session.get(url) as response:
                    if response.status == 200:
                        return await response.text()
                    else:
                        print(f"Ошибка при загрузке {url}: статус {response.status}")
                        return None
        except Exception as e:
            print(f"Ошибка при загрузке {url}: {e}")
            return None
    
    async def download_image(self, image_url: str) -> Optional[bytes]:
        """Скачать изображение"""
        try:
            # Пропускаем base64 изображения (они уже в данных)
            if image_url.startswith("data:image"):
                # Извлекаем base64 данные
                header, encoded = image_url.split(",", 1)
                return base64.b64decode(encoded)
            
            # Если URL относительный, делаем его абсолютным
            if image_url.startswith("/"):
                image_url = f"{self.BASE_URL}{image_url}"
            elif not image_url.startswith("http"):
                image_url = f"{self.BASE_URL}/{image_url}"
            
            # Используем Playwright для загрузки, если доступен
            if self.use_playwright and self.browser:
                page = await self.browser.new_page()
                try:
                    response = await page.goto(image_url, wait_until="networkidle", timeout=15000)
                    if response and response.status == 200:
                        return await response.body()
                    else:
                        print(f"Ошибка при загрузке изображения {image_url}: статус {response.status if response else 'нет ответа'}")
                        return None
                except Exception as e:
                    print(f"      ⚠️  Исключение при загрузке через Playwright {image_url}: {e}")
                    return None
                finally:
                    await page.close()
            else:
                # Обычный HTTP запрос
                if not self.http_session:
                    print(f"      ⚠️  HTTP сессия не инициализирована")
                    return None
                try:
                    async with self.http_session.get(image_url) as response:
                        if response.status == 200:
                            data = await response.read()
                            if data and len(data) > 0:
                                return data
                            else:
                                print(f"      ⚠️  Пустое тело ответа для {image_url}")
                                return None
                        else:
                            print(f"      ⚠️  Ошибка при загрузке изображения {image_url}: статус {response.status}")
                            return None
                except Exception as e:
                    print(f"      ⚠️  Исключение при загрузке через HTTP {image_url}: {e}")
                    return None
        except Exception as e:
            print(f"Ошибка при загрузке изображения {image_url}: {e}")
            return None
    
    def parse_price(self, price_text: str) -> Optional[int]:
        """Извлечь цену из текста"""
        if not price_text:
            return None
        
        # Удаляем все кроме цифр
        numbers = re.sub(r"[^\d]", "", price_text)
        if numbers:
            return int(numbers)
        return None
    
    def parse_bouquet_card(self, card_element) -> Optional[dict]:
        """Парсинг карточки букета со страницы каталога"""
        try:
            # Название букета - пробуем разные варианты
            name = None
            name_elem = (
                card_element.find(class_=re.compile("ps-teaser-card__title", re.I)) or
                card_element.find("h1") or
                card_element.find("h2") or
                card_element.find("h3") or
                card_element.find("h4") or
                card_element.find(class_=re.compile("title|name|product.*name|bouquet.*name", re.I)) or
                card_element.find(attrs={"data-name": True})
            )
            
            if name_elem:
                name = name_elem.get_text(strip=True)
                # Если это data-атрибут
                if not name and name_elem.get("data-name"):
                    name = name_elem.get("data-name")
            
            # Если не нашли, пробуем найти в ссылке
            if not name:
                link_elem = card_element.find("a")
                if link_elem:
                    name = link_elem.get_text(strip=True)
                    # Или из title атрибута
                    if not name:
                        name = link_elem.get("title", "").strip()
            
            # Если все еще нет, пробуем из alt изображения
            if not name:
                img_elem = card_element.find("img")
                if img_elem:
                    name = img_elem.get("alt", "").strip()
            
            if not name or len(name) < 2:
                return None
            
            # Цена - пробуем разные варианты
            price = None
            # Сначала ищем по классу ps-teaser-card__price
            price_elem = (
                card_element.find(class_=re.compile("ps-teaser-card__price", re.I)) or
                card_element.find(class_=re.compile("price|cost|amount|sum", re.I)) or
                card_element.find(attrs={"data-price": True}) or
                card_element.find(string=re.compile(r"\d+\s*[₽руб]|цена", re.I))
            )
            
            if price_elem:
                if isinstance(price_elem, str):
                    price = self.parse_price(price_elem)
                elif price_elem.get("data-price"):
                    price = self.parse_price(price_elem.get("data-price"))
                else:
                    price = self.parse_price(price_elem.get_text())
            
            # Если не нашли цену в элементе, ищем в тексте всей карточки
            if not price:
                card_text = card_element.get_text()
                price_match = re.search(r"(\d+)\s*[₽руб]", card_text)
                if price_match:
                    price = int(price_match.group(1))
            
            # Ссылка на детальную страницу
            link_elem = card_element.find("a", href=True)
            detail_url = None
            if link_elem:
                href = link_elem.get("href", "")
                if href.startswith("/"):
                    detail_url = f"{self.BASE_URL}{href}"
                elif href.startswith("http"):
                    detail_url = href
                else:
                    detail_url = f"{self.BASE_URL}/{href}"
            
            # Изображения - ищем все изображения в карточке
            images = []
            
            # Сначала ищем div с классом ps-img-adapt (изображения в background-image)
            ps_img_divs = card_element.find_all("div", class_=lambda x: x and "ps-img-adapt" in " ".join(x).lower() if isinstance(x, list) else "ps-img-adapt" in str(x).lower() if x else False)
            for div in ps_img_divs:
                style = div.get("style", "")
                bg_match = re.search(r"background-image:\s*url\(['\"]?([^'\"]+)['\"]?\)", style)
                if bg_match:
                    image_url = bg_match.group(1)
                    # Очищаем от HTML entities
                    image_url = image_url.replace("&quot;", "").replace("&amp;", "&")
                    if image_url.startswith("/"):
                        image_url = f"{self.BASE_URL}{image_url}"
                    elif not image_url.startswith("http") and not image_url.startswith("data:"):
                        image_url = f"{self.BASE_URL}/{image_url}"
                    if image_url not in images:
                        images.append(image_url)
            
            # Если не нашли через ps-img-adapt, ищем обычные img
            if not images:
                img_elements = card_element.find_all("img")
                for img_elem in img_elements:
                    # Пробуем разные атрибуты для lazy loading
                    image_url = (
                        img_elem.get("src") or
                        img_elem.get("data-src") or
                        img_elem.get("data-lazy-src") or
                        img_elem.get("data-original") or
                        img_elem.get("data-image") or
                        img_elem.get("data-url") or
                        img_elem.get("ng-src") or  # Angular
                        img_elem.get("[src]")  # Angular binding
                    )
                    
                    # Пробуем srcset
                    if not image_url and img_elem.get("srcset"):
                        srcset = img_elem.get("srcset")
                        # Берем первый URL из srcset
                        image_url = srcset.split(",")[0].strip().split()[0] if srcset else None
                    
                    # Пробуем background-image из style
                    if not image_url:
                        style = img_elem.get("style", "")
                        bg_match = re.search(r"background-image:\s*url\(['\"]?([^'\"]+)['\"]?\)", style)
                        if bg_match:
                            image_url = bg_match.group(1)
                    
                    if image_url:
                        # Пропускаем placeholder и маленькие иконки
                        if any(skip in image_url.lower() for skip in ["placeholder", "icon", "logo", "spinner", "loading"]):
                            continue
                        
                        # Очищаем от параметров (но сохраняем расширение)
                        if "?" in image_url:
                            image_url = image_url.split("?")[0]
                        
                        # Делаем абсолютным URL
                        if image_url.startswith("/"):
                            image_url = f"{self.BASE_URL}{image_url}"
                        elif not image_url.startswith("http") and not image_url.startswith("data:"):
                            image_url = f"{self.BASE_URL}/{image_url}"
                        
                        if image_url not in images:
                            images.append(image_url)
            
            # Если не нашли изображения, пробуем найти через background-image в стилях родителя
            if not images:
                style = card_element.get("style", "")
                bg_match = re.search(r"background-image:\s*url\(['\"]?([^'\"]+)['\"]?\)", style)
                if bg_match:
                    image_url = bg_match.group(1)
                    if image_url.startswith("/"):
                        image_url = f"{self.BASE_URL}{image_url}"
                    elif not image_url.startswith("http") and not image_url.startswith("data:"):
                        image_url = f"{self.BASE_URL}/{image_url}"
                    images.append(image_url)
            
            image_url = images[0] if images else None
            
            return {
                "name": name,
                "price": price,
                "detail_url": detail_url,
                "image_url": image_url,
                "images": images  # Все найденные изображения
            }
        except Exception as e:
            print(f"Ошибка при парсинге карточки букета: {e}")
            return None
    
    async def parse_bouquet_detail(self, url: str) -> Optional[dict]:
        """Парсинг детальной страницы букета"""
        html = await self.fetch_page(url)
        if not html:
            return None
        
        soup = BeautifulSoup(html, "html.parser")
        
        try:
            # Название
            name_elem = soup.find("h1") or soup.find(class_=re.compile("title|name|product-title", re.I))
            name = name_elem.get_text(strip=True) if name_elem else None
            
            # Описание
            desc_elem = soup.find(class_=re.compile("description|desc|content", re.I))
            if not desc_elem:
                desc_elem = soup.find("div", class_=re.compile("product.*description", re.I))
            description = desc_elem.get_text(strip=True) if desc_elem else "Описание отсутствует"
            
            # Цена
            price_elem = soup.find(class_=re.compile("price|cost", re.I))
            price = None
            if price_elem:
                price = self.parse_price(price_elem.get_text())
            
            # Изображения - агрессивный поиск всех изображений
            images = []
            
            # Сначала ищем div с классом ps-img-adapt (изображения в background-image)
            ps_img_divs = soup.find_all("div", class_=lambda x: x and "ps-img-adapt" in " ".join(x).lower() if isinstance(x, list) else "ps-img-adapt" in str(x).lower() if x else False)
            for div in ps_img_divs:
                style = div.get("style", "")
                bg_match = re.search(r"background-image:\s*url\(['\"]?([^'\"]+)['\"]?\)", style)
                if bg_match:
                    img_src = bg_match.group(1)
                    # Очищаем от HTML entities
                    img_src = img_src.replace("&quot;", "").replace("&amp;", "&")
                    if img_src.startswith("/"):
                        img_src = f"{self.BASE_URL}{img_src}"
                    elif not img_src.startswith("http") and not img_src.startswith("data:"):
                        img_src = f"{self.BASE_URL}/{img_src}"
                    if img_src not in images:
                        images.append(img_src)
            
            # Если не нашли через ps-img-adapt, ищем обычные img
            if not images:
                img_elements = soup.find_all("img")
                for img in img_elements:
                    # Пробуем разные атрибуты
                    img_src = (
                        img.get("src") or
                        img.get("data-src") or
                        img.get("data-lazy-src") or
                        img.get("data-original") or
                        img.get("data-image") or
                        img.get("ng-src") or  # Angular
                        img.get("[src]")  # Angular binding
                    )
                    
                    # Пробуем srcset
                    if not img_src and img.get("srcset"):
                        srcset = img.get("srcset")
                        img_src = srcset.split(",")[0].strip().split()[0] if srcset else None
                    
                    # Пропускаем placeholder и маленькие иконки
                    if img_src and any(skip in img_src.lower() for skip in ["placeholder", "icon", "logo", "spinner", "loading", "avatar"]):
                        continue
                    
                    if img_src:
                        # Очищаем от параметров
                        if "?" in img_src:
                            img_src = img_src.split("?")[0]
                        
                        # Делаем абсолютным URL
                        if img_src.startswith("/"):
                            img_src = f"{self.BASE_URL}{img_src}"
                        elif not img_src.startswith("http") and not img_src.startswith("data:"):
                            img_src = f"{self.BASE_URL}/{img_src}"
                        
                        # Проверяем, что это изображение товара (не обязательно, но желательно)
                        if img_src not in images:
                            # Если есть фильтр по словам, применяем его, иначе берем все
                            if any(word in img_src.lower() for word in ["bouquet", "product", "flower", "item", "tovar", "товар", "image", "photo", "pic"]) or len(images) == 0:
                                images.append(img_src)
            
            # Если не нашли изображения, ищем в галерее/слайдере
            if not images:
                gallery = soup.find(class_=re.compile("gallery|slider|carousel|swiper|image", re.I))
                if gallery:
                    gallery_imgs = gallery.find_all("img")
                    for img in gallery_imgs:
                        img_src = (
                            img.get("src") or
                            img.get("data-src") or
                            img.get("data-lazy-src") or
                            img.get("ng-src")
                        )
                        if img_src:
                            if img_src.startswith("/"):
                                img_src = f"{self.BASE_URL}{img_src}"
                            elif not img_src.startswith("http") and not img_src.startswith("data:"):
                                img_src = f"{self.BASE_URL}/{img_src}"
                            if img_src not in images:
                                images.append(img_src)
            
            # Ищем background-image в стилях
            if not images:
                all_elements = soup.find_all(attrs={"style": True})
                for elem in all_elements:
                    style = elem.get("style", "")
                    bg_matches = re.findall(r"background-image:\s*url\(['\"]?([^'\"]+)['\"]?\)", style)
                    for bg_url in bg_matches:
                        if bg_url.startswith("/"):
                            bg_url = f"{self.BASE_URL}{bg_url}"
                        elif not bg_url.startswith("http") and not bg_url.startswith("data:"):
                            bg_url = f"{self.BASE_URL}/{bg_url}"
                        if bg_url not in images and not any(skip in bg_url.lower() for skip in ["placeholder", "icon", "logo"]):
                            images.append(bg_url)
            
            return {
                "name": name,
                "description": description,
                "price": price,
                "images": images
            }
        except Exception as e:
            print(f"Ошибка при парсинге детальной страницы {url}: {e}")
            return None
    
    async def parse_catalog_page(self, url: str, debug: bool = False) -> list[dict]:
        """Парсинг страницы каталога"""
        # Для Angular приложений ждем загрузки контента
        html = await self.fetch_page(url, wait_for_selector="app")
        if not html:
            return []
        
        soup = BeautifulSoup(html, "html.parser")
        bouquets = []
        
        if debug:
            # Сохраняем HTML для анализа
            with open("debug_page.html", "w", encoding="utf-8") as f:
                f.write(html)
            print(f"   💾 HTML сохранен в debug_page.html")
        
        # Ищем карточки товаров - пробуем разные селекторы
        cards = []
        
        # Вариант 1: По классам (более агрессивный поиск)
        selectors = [
            ("teaser-card", {"class": re.compile("ps-teaser__item", re.I)}),  # Специфичный селектор для lascovo.ru
            ("div", {"class": re.compile("ps-teaser-card", re.I)}),  # Карточки товаров
            ("div", {"class": re.compile("product|bouquet|card|item|goods|tovar|товар", re.I)}),
            ("article", {"class": re.compile("product|bouquet|card|item", re.I)}),
            ("div", {"class": re.compile("catalog|shop|store|магазин", re.I)}),
            ("li", {"class": re.compile("product|bouquet|item|goods", re.I)}),
            ("div", {"class": re.compile("col|grid|flex|wrapper", re.I)}),  # Общие контейнеры
        ]
        
        for tag, attrs in selectors:
            try:
                found = soup.find_all(tag, attrs)
                if found:
                    cards.extend(found)
                    if debug:
                        print(f"   ✓ Найдено через {tag} с {attrs}: {len(found)} элементов")
            except Exception as e:
                if debug:
                    print(f"   ✗ Ошибка при поиске через {tag}: {e}")
        
        # Вариант 2: По data-атрибутам
        try:
            data_selectors = [
                soup.find_all(attrs={"data-product": True}),
                soup.find_all(attrs={"data-id": True}),
                soup.find_all(attrs={"data-item": True}),
                soup.find_all(attrs={"data-sku": True}),
            ]
            for found in data_selectors:
                if found:
                    cards.extend(found)
                    if debug:
                        print(f"   ✓ Найдено через data-атрибуты: {len(found)} элементов")
        except Exception as e:
            if debug:
                print(f"   ✗ Ошибка при поиске data-атрибутов: {e}")
        
        # Вариант 3: По структуре (ссылки с изображениями) - более агрессивный
        try:
            links_with_images = soup.find_all("a", href=True)
            for link in links_with_images:
                img = link.find("img")
                href = link.get("href", "").lower()
                # Ищем ссылки, которые могут вести на товары
                if img and (
                    any(word in href for word in ["bouquet", "product", "catalog", "item", "tovar", "товар", "цвет", "букет"]) or
                    "/" in href and href.count("/") >= 2  # Ссылки вида /catalog/item/123
                ):
                    cards.append(link)
            if debug and links_with_images:
                print(f"   ✓ Проверено ссылок с изображениями: {len(links_with_images)}")
        except Exception as e:
            if debug:
                print(f"   ✗ Ошибка при поиске ссылок: {e}")
        
        # Вариант 4: Ищем все div/article с изображениями внутри (самый агрессивный)
        if not cards:
            try:
                all_divs = soup.find_all(["div", "article", "li", "section"])
                for elem in all_divs:
                    img = elem.find("img")
                    link = elem.find("a", href=True)
                    text = elem.get_text(strip=True)
                    # Если есть изображение, ссылка и текст (название), это может быть карточка
                    if img and link and len(text) > 10 and len(text) < 500:
                        # Проверяем, что это не навигация или футер
                        classes = " ".join(elem.get("class", [])).lower()
                        if not any(skip in classes for skip in ["nav", "menu", "footer", "header", "sidebar"]):
                            cards.append(elem)
                if debug:
                    print(f"   ✓ Агрессивный поиск: проверено {len(all_divs)} элементов, найдено {len(cards)} потенциальных карточек")
            except Exception as e:
                if debug:
                    print(f"   ✗ Ошибка при агрессивном поиске: {e}")
        
        # Удаляем дубликаты
        seen = set()
        unique_cards = []
        for card in cards:
            card_id = id(card)
            if card_id not in seen:
                seen.add(card_id)
                unique_cards.append(card)
        
        if debug:
            print(f"   📊 Всего найдено уникальных карточек: {len(unique_cards)}")
        
        # Предпочитаем карточки, в которых есть изображение
        image_cards = [
            card for card in unique_cards
            if card.find("div", class_=lambda x: x and "ps-img-adapt" in " ".join(x).lower()
                         if isinstance(x, list) else "ps-img-adapt" in str(x).lower() if x else False)
        ]
        cards_to_parse = image_cards if image_cards else unique_cards

        # Парсим каждую карточку
        for card in cards_to_parse:
            bouquet_data = self.parse_bouquet_card(card)
            if bouquet_data and bouquet_data.get("images"):
                bouquets.append(bouquet_data)
        
        if debug and not bouquets:
            # Выводим примеры найденных элементов для отладки
            print(f"   🔍 Примеры найденных элементов (первые 5):")
            for i, card in enumerate(unique_cards[:5]):
                classes = " ".join(card.get("class", []))
                text_preview = card.get_text(strip=True)[:50] if card.get_text(strip=True) else "нет текста"
                print(f"      {i+1}. <{card.name}> class='{classes}' text='{text_preview}...'")
                # Показываем структуру
                img_count = len(card.find_all("img"))
                link_count = len(card.find_all("a"))
                print(f"          (изображений: {img_count}, ссылок: {link_count})")
        
        return bouquets
    
    async def create_bouquet_from_data(
        self,
        bouquet_data: dict,
        default_bouquet_type_id: UUID,
        default_flower_type_ids: list[UUID] | None = None
    ) -> bool:
        """Создать букет из распарсенных данных"""
        try:
            # Если есть детальная страница, парсим её для получения полной информации
            if bouquet_data.get("detail_url"):
                detail_data = await self.parse_bouquet_detail(bouquet_data["detail_url"])
                if detail_data:
                    bouquet_data.update(detail_data)
            
            # Проверяем обязательные поля
            if not bouquet_data.get("name"):
                print(f"Пропущен букет: отсутствует название")
                return False
            
            price = bouquet_data.get("price")
            if not price or price <= 0:
                print(f"Пропущен букет '{bouquet_data['name']}': некорректная цена")
                return False

            # Определяем типы цветов и тип букета по ключевым словам
            name_text = bouquet_data.get("name", "")
            description_text = bouquet_data.get("description", "")
            combined_text = normalize_text(f"{name_text} {description_text}")

            bouquet_type_id = default_bouquet_type_id
            if self.bouquet_type_keywords:
                bouquet_type_id = detect_bouquet_type_id(
                    combined_text,
                    self.bouquet_type_keywords,
                    default_bouquet_type_id
                )

            flower_type_ids = default_flower_type_ids or []
            if self.flower_type_keywords:
                detected_flowers = detect_flower_type_ids(
                    combined_text,
                    self.flower_type_keywords
                )
                if detected_flowers:
                    flower_type_ids = detected_flowers

            print(f"   🏷️  Определен тип букета: {bouquet_type_id}")
            print(f"   🌸 Определены типы цветов: {flower_type_ids}")
            
            # Загружаем изображения
            image_files = []
            images = bouquet_data.get("images", [])
            if not images and bouquet_data.get("image_url"):
                images = [bouquet_data["image_url"]]
            
            print(f"   📸 Найдено изображений для '{bouquet_data['name']}': {len(images)}")
            
            for idx, img_url in enumerate(images[:5], 1):  # Ограничиваем до 5 изображений
                print(f"      Загрузка изображения {idx}/{min(len(images), 5)}: {img_url[:80]}...")
                img_data = await self.download_image(img_url)
                if img_data:
                    print(f"      ✓ Изображение загружено, размер: {len(img_data)} байт")
                    # Создаем UploadFile из байтов
                    filename = img_url.split("/")[-1] or "image.jpg"
                    # Убираем параметры из имени файла
                    if "?" in filename:
                        filename = filename.split("?")[0]
                    if not filename.endswith((".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp")):
                        filename = f"{filename}.jpg"
                    
                    # Определяем content_type по расширению
                    content_type = "image/jpeg"
                    if filename.endswith(".png"):
                        content_type = "image/png"
                    elif filename.endswith(".webp"):
                        content_type = "image/webp"
                    elif filename.endswith(".gif"):
                        content_type = "image/gif"
                    
                    # Создаем файловый объект
                    file_obj = BytesIO(img_data)
                    # Важно: нужно установить позицию в начало
                    file_obj.seek(0)
                    
                    # Создаем UploadFile с правильными параметрами
                    upload_file = UploadFile(
                        file=file_obj,
                        filename=filename,
                        headers={"content-type": content_type}
                    )
                    
                    image_files.append(upload_file)
                    print(f"      ✓ Файл подготовлен: {filename} ({content_type}, {len(img_data)} байт)")
                else:
                    print(f"      ✗ Не удалось загрузить изображение: {img_url}")
            
            print(f"   📦 Всего подготовлено файлов: {len(image_files)}")
            
            # Создаем букет
            print(f"   🔨 Создание букета '{bouquet_data['name']}' с {len(image_files)} изображениями...")
            create_data = BouquetCreateSchema(
                name=bouquet_data["name"],
                description=bouquet_data.get("description", bouquet_data['name']),
                price=price,
                quantity=2,  # По умолчанию 2
                bouquet_type_id=bouquet_type_id,
                flower_type_ids=flower_type_ids or None,
                images=image_files if image_files else None
            )
            
            result = await self.bouquet_service.create_bouquet(create_data)
            print(f"✓ Создан букет: {bouquet_data['name']} ({price} руб.)")
            if result.main_image:
                print(f"   ✓ Основное изображение: {result.main_image.image_path}")
            else:
                print(f"   ⚠️  Основное изображение не найдено")
            return True
            
        except Exception as e:
            print(f"✗ Ошибка при создании букета '{bouquet_data.get('name', 'Unknown')}': {e}")
            return False


async def main(catalog_url: Optional[str] = None, debug: bool = False, use_playwright: bool = True):
    """Основная функция парсера"""
    print("🚀 Запуск парсера lascovo.ru...")
    
    if use_playwright and not PLAYWRIGHT_AVAILABLE:
        print("⚠️  Playwright не установлен. Устанавливаю...")
        print("   Выполните: pip install playwright && playwright install chromium")
        use_playwright = False
    
    # Создаем подключение к БД
    engine = create_async_engine(DB_CONFIG.get_url(is_async=True))
    
    async with AsyncSession(engine) as session:
        async with LascovoParser(session, use_playwright=use_playwright) as parser:
            # Получаем типы букетов
            from app.core.repositories.bouquet_repository import BouquetRepository
            repo = BouquetRepository(session)
            bouquet_types = await repo.get_bouquet_types()
            
            if not bouquet_types:
                print("❌ Ошибка: нет типов букетов в БД. Создайте хотя бы один тип букета.")
                return
            
            default_bouquet_type_id = bouquet_types[0].id
            print(f"📦 Используется тип букета: {bouquet_types[0].name} (ID: {default_bouquet_type_id})")

            # Получаем типы цветов
            flower_repo = FlowerRepository(session)
            flower_types = await flower_repo.get_all_items()
            if not flower_types:
                print("⚠️  Типы цветов не найдены, определение по ключевым словам отключено")
            else:
                print(f"🌼 Найдено типов цветов: {len(flower_types)}")

            # Строим карты ключевых слов для определения типов
            parser.bouquet_type_keywords = build_bouquet_keyword_list(bouquet_types)
            parser.flower_type_keywords = build_flower_keyword_map(flower_types)
            
            # Парсим каталог
            if catalog_url:
                catalog_urls = [catalog_url]
            else:
                catalog_urls = [
                    f"{parser.BASE_URL}/",  # Базовый URL - каталог находится здесь
                    f"{parser.BASE_URL}/catalog",  # На случай, если есть отдельная страница каталога
                    f"{parser.BASE_URL}/bouquets",
                ]
            
            all_bouquets = []
            for url in catalog_urls:
                print(f"\n📄 Парсинг страницы: {url}")
                # Используем debug если указан флаг или для первой попытки
                use_debug = debug or (not catalog_url and url == catalog_urls[0])
                bouquets = await parser.parse_catalog_page(url, debug=use_debug)
                if bouquets:
                    all_bouquets.extend(bouquets)
                    print(f"   Найдено букетов: {len(bouquets)}")
                    if catalog_url:
                        break  # Если указан конкретный URL, останавливаемся после первого успеха
                else:
                    print(f"   Букеты не найдены на странице")
            
            if not all_bouquets:
                print("\n⚠️  Букеты не найдены. Возможно, структура сайта изменилась.")
                print("   Попробуйте:")
                print("   1. Указать конкретный URL: python -m scripts.parse_lascovo --url https://lascovo.ru/catalog")
                print("   2. Обновить селекторы в методе parse_catalog_page()")
                return
            
            print(f"\n📦 Всего найдено букетов: {len(all_bouquets)}")
            print("\n🔄 Начинаем импорт...\n")
            
            # Импортируем букеты
            success_count = 0
            for bouquet_data in all_bouquets:
                success = await parser.create_bouquet_from_data(
                    bouquet_data,
                    default_bouquet_type_id=default_bouquet_type_id
                )
                if success:
                    success_count += 1
                    await session.commit()
                else:
                    await session.rollback()
            
            print(f"\n✅ Импорт завершен: {success_count}/{len(all_bouquets)} букетов успешно создано")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Парсер букетов с lascovo.ru")
    parser.add_argument(
        "--url",
        type=str,
        help="URL страницы каталога для парсинга (например: https://lascovo.ru/catalog)"
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Включить отладочный режим (сохраняет HTML и выводит дополнительную информацию)"
    )
    parser.add_argument(
        "--no-playwright",
        action="store_true",
        help="Не использовать Playwright (только для статических сайтов)"
    )
    args = parser.parse_args()
    
    asyncio.run(main(catalog_url=args.url, debug=args.debug, use_playwright=not args.no_playwright))

