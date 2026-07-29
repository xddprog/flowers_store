import { axiosNoAuth } from "@/shared/api/baseQueryInstance";
import type { SiteAssetList } from "../types";

class SiteAssetService {
  public async getSiteAssets(): Promise<SiteAssetList> {
    const { data } = await axiosNoAuth.get<SiteAssetList>("/api/v1/site-assets/");
    return data;
  }
}

export const siteAssetService = new SiteAssetService();
