from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.v1.dependencies import get_site_asset_service
from app.core.dto.site_asset import SiteAssetListSchema
from app.core.services.site_asset_service import SiteAssetService


router = APIRouter()


@router.get("/")
async def get_site_assets(
    service: Annotated[SiteAssetService, Depends(get_site_asset_service)],
) -> SiteAssetListSchema:
    return await service.get_assets()
