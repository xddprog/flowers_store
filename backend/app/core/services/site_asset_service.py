import asyncio
import io
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from PIL import Image
from pillow_heif import register_heif_opener

from app.core.dto.site_asset import SiteAssetListSchema, SiteAssetSchema
from app.infrastructure.config.config import APP_CONFIG, BASE_DIR

register_heif_opener()

SITE_ASSET_SLOTS = {
    "hero": {
        "label": "Шапка сайта",
        "fallback": "/images/bg-dashboard.png",
        "basename": "hero",
    },
    "gallery-author": {
        "label": "Авторские букеты",
        "fallback": "/images/gallery/author-bouquet.jpg",
        "basename": "gallery-author",
    },
    "gallery-mono": {
        "label": "Монобукеты",
        "fallback": "/images/gallery/monobouquet.jpg",
        "basename": "gallery-mono",
    },
    "gallery-composition": {
        "label": "Композиции",
        "fallback": "/images/gallery/composition.jpg",
        "basename": "gallery-composition",
    },
    "about": {
        "label": "Нижний блок",
        "fallback": "/images/flower.png",
        "basename": "about",
    },
}

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"}


class SiteAssetService:
    def __init__(self) -> None:
        self.asset_dir = BASE_DIR / "static" / "images" / "site"
        self.asset_dir.mkdir(parents=True, exist_ok=True)

    async def get_assets(self) -> SiteAssetListSchema:
        return SiteAssetListSchema(
            assets=[
                SiteAssetSchema(
                    key=key,
                    label=config["label"],
                    url=self._get_asset_url(key),
                )
                for key, config in SITE_ASSET_SLOTS.items()
            ]
        )

    async def upload_asset(self, key: str, file: UploadFile) -> SiteAssetSchema:
        config = self._get_slot_config(key)
        self._validate_file(file)
        contents = await file.read()
        if not contents:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Файл изображения пустой",
            )

        target_path = self.asset_dir / f"{config['basename']}.webp"
        await asyncio.to_thread(
            self._convert_and_replace_file,
            config["basename"],
            target_path,
            contents,
        )

        return SiteAssetSchema(
            key=key,
            label=config["label"],
            url=self._build_static_url(target_path),
        )

    def _get_asset_url(self, key: str) -> str:
        config = self._get_slot_config(key)
        for extension in [".webp", ".jpg", ".jpeg", ".png"]:
            path = self.asset_dir / f"{config['basename']}{extension}"
            if path.exists():
                return self._build_static_url(path)
        return config["fallback"]

    def _build_static_url(self, path: Path) -> str:
        relative_path = path.relative_to(BASE_DIR / "static" / "images")
        url = f"{APP_CONFIG.STATIC_URL.rstrip('/')}/{relative_path.as_posix()}"
        return f"{url}?v={int(path.stat().st_mtime)}"

    def _get_slot_config(self, key: str) -> dict[str, str]:
        config = SITE_ASSET_SLOTS.get(key)
        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Изображение для этого блока не найдено",
            )
        return config

    def _validate_file(self, file: UploadFile) -> None:
        suffix = Path(file.filename or "").suffix.lower()
        if suffix not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Поддерживаются JPG, PNG, WebP и HEIC",
            )
        if file.content_type and not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Файл должен быть изображением",
            )

    def _convert_and_replace_file(
        self, basename: str, target_path: Path, contents: bytes
    ) -> None:
        target_path.parent.mkdir(parents=True, exist_ok=True)
        for extension in ALLOWED_EXTENSIONS:
            old_path = target_path.parent / f"{basename}{extension}"
            if old_path.exists() and old_path != target_path:
                old_path.unlink()

        with Image.open(io.BytesIO(contents)) as image:
            image = self._convert_to_rgb(image)
            image.save(
                target_path,
                "WEBP",
                quality=APP_CONFIG.WEBP_QUALITY,
                method=6,
                optimize=True,
            )

    @staticmethod
    def _convert_to_rgb(image: Image.Image) -> Image.Image:
        if image.mode in ("RGBA", "LA", "P"):
            background = Image.new("RGB", image.size, (255, 255, 255))

            if image.mode == "P":
                image = image.convert("RGBA")

            if image.mode in ("RGBA", "LA"):
                background.paste(image, mask=image.split()[-1])
            else:
                background.paste(image)

            return background

        if image.mode != "RGB":
            return image.convert("RGB")

        return image
