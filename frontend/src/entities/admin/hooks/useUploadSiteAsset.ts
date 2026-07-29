import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import {
  GET_ADMIN_SITE_ASSETS_QUERY,
  UPLOAD_SITE_ASSET_MUTATION,
} from "../lib/queryKeys";
import { GET_SITE_ASSETS_QUERY } from "@/entities/siteAssets/lib/queryKeys";
import type { SiteAsset } from "../types/apiTypes";

export const useUploadSiteAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [UPLOAD_SITE_ASSET_MUTATION],
    mutationFn: async ({
      key,
      file,
    }: {
      key: string;
      file: File;
    }): Promise<SiteAsset> => {
      return await adminService.uploadSiteAsset(key, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_ADMIN_SITE_ASSETS_QUERY] });
      queryClient.invalidateQueries({ queryKey: [GET_SITE_ASSETS_QUERY] });
    },
  });
};
