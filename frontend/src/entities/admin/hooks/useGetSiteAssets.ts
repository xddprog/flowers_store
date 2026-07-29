import { useQuery } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import { GET_ADMIN_SITE_ASSETS_QUERY } from "../lib/queryKeys";
import type { SiteAssetList } from "../types/apiTypes";

export const useGetSiteAssets = () => {
  return useQuery({
    queryKey: [GET_ADMIN_SITE_ASSETS_QUERY],
    queryFn: async (): Promise<SiteAssetList> => {
      return await adminService.getSiteAssets();
    },
  });
};
