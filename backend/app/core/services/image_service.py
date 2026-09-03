import io
import uuid
import shutil
from pathlib import Path
import asyncio

from PIL import Image
from pillow_heif import register_heif_opener
from fastapi import UploadFile

from app.infrastructure.config.config import APP_CONFIG, BASE_DIR
from app.infrastructure.errors.image_errors import (
    InvalidImageType,
    InvalidImageFormat,
    EmptyImageFile,
    ImageProcessingError
)

register_heif_opener()


class ImageService:
    def __init__(self):
        images_dir = BASE_DIR / "static" / "images"
        images_dir.mkdir(parents=True, exist_ok=True)
        self.images_dir = images_dir
    
    async def upload_and_convert(
        self, 
        file: UploadFile, 
        subfolder: str = "products"
    ) -> str:
        await self._validate_file(file)
        contents = await file.read()
        await file.seek(0)
        
        target_dir = self.images_dir / subfolder
        target_dir.mkdir(parents=True, exist_ok=True)
        
        filename = f"{uuid.uuid4()}.webp"
        filepath = target_dir / filename
        
        await asyncio.to_thread(
            self._convert_and_save,
            contents,
            filepath
        )
        
        return f"{subfolder}/{filename}"

    async def get_storage_usage(self) -> dict[str, int | float]:
        return await asyncio.to_thread(self._get_storage_usage)

    def _get_storage_usage(self) -> dict[str, int | float]:
        image_files_size = sum(
            path.stat().st_size
            for path in self.images_dir.rglob("*")
            if path.is_file()
        )
        disk_usage = shutil.disk_usage(self.images_dir)
        return {
            "image_files_size": image_files_size,
            "disk_total": disk_usage.total,
            "disk_used": disk_usage.used,
            "disk_free": disk_usage.free,
            "disk_used_percent": round(
                (disk_usage.used / disk_usage.total) * 100, 2
            )
            if disk_usage.total
            else 0,
        }
    
    def _convert_and_save(self, contents: bytes, filepath: Path) -> None:
        try:
            image = Image.open(io.BytesIO(contents))
            
            image = self._convert_to_rgb(image)
            
            image.save(
                filepath,
                "WEBP",
                quality=APP_CONFIG.WEBP_QUALITY,
                method=6,
                optimize=True
            )
            
        except Exception as e:
            raise ImageProcessingError(str(e))
    
    def _convert_to_rgb(self, image: Image.Image) -> Image.Image:
        if image.mode in ("RGBA", "LA", "P"):
            background = Image.new("RGB", image.size, (255, 255, 255))
            
            if image.mode == "P":
                image = image.convert("RGBA")
            
            if image.mode in ("RGBA", "LA"):
                background.paste(image, mask=image.split()[-1])
            else:
                background.paste(image)
            
            return background
        
        elif image.mode != "RGB":
            return image.convert("RGB")
        
        return image
    
    async def _validate_file(self, file: UploadFile) -> None:
        allowed_extensions = {
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".bmp",
            ".webp",
            ".heic",
            ".heif",
        }
        file_ext = Path(file.filename or "").suffix.lower()

        if file.filename:
            if file_ext not in allowed_extensions:
                raise InvalidImageFormat(', '.join(allowed_extensions))
        elif not file.content_type or not file.content_type.startswith("image/"):
            raise InvalidImageType()

        if (
            file.content_type
            and not file.content_type.startswith("image/")
            and file_ext not in allowed_extensions
        ):
            raise InvalidImageType()
        
        file.file.seek(0, 2)
        size = file.file.tell()
        file.file.seek(0)
        
        if size == 0:
            raise EmptyImageFile()
    
    async def delete_image(self, image_path: str) -> bool:
        try:
            full_path = (self.images_dir / image_path).resolve()
            if not full_path.is_relative_to(self.images_dir.resolve()):
                return False
            
            await asyncio.to_thread(self._delete_file, full_path)
            return True
            
        except Exception:
            return False
    
    @staticmethod
    def _delete_file(filepath: Path) -> None:
        if filepath.exists() and filepath.is_file():
            filepath.unlink()
    

    async def upload_multiple(
        self, 
        files: list[UploadFile], 
        subfolder: str
    ) -> list[str]:
        tasks = [
            self.upload_and_convert(file, subfolder)
            for file in files
        ]
        return await asyncio.gather(*tasks)

    async def delete_multiple(self, image_paths: list[str]) -> None:
        tasks = [
            self.delete_image(image_path)
            for image_path in image_paths
        ]
        await asyncio.gather(*tasks)
