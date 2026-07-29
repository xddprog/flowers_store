from pydantic import BaseModel


class SiteAssetSchema(BaseModel):
    key: str
    label: str
    url: str


class SiteAssetListSchema(BaseModel):
    assets: list[SiteAssetSchema]
