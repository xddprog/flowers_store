from pydantic import BaseModel


class ImageStorageUsageSchema(BaseModel):
    image_files_size: int
    disk_total: int
    disk_used: int
    disk_free: int
    disk_used_percent: float
