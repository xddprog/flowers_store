import { useQuery } from "@tanstack/react-query";
import { siteAssetService } from "../api/siteAssetService";
import { DEFAULT_SITE_ASSETS } from "../lib/constants";
import { GET_SITE_ASSETS_QUERY } from "../lib/queryKeys";

export const useSiteAssets = () => {
  const query = useQuery({
    queryKey: [GET_SITE_ASSETS_QUERY],
    queryFn: () => siteAssetService.getSiteAssets(),
    staleTime: 60 * 1000,
  });

  const getAssetUrl = (key: string) => {
    const asset = query.data?.assets.find((item) => item.key === key);
    return asset?.url || DEFAULT_SITE_ASSETS[key];
  };

  return {
    ...query,
    getAssetUrl,
  };
};
