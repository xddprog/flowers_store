import { useQuery } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import { GET_IMAGE_STORAGE_USAGE_QUERY } from "../lib/queryKeys";
import type { ImageStorageUsage } from "../types/apiTypes";

export const useGetImageStorageUsage = () => {
  return useQuery({
    queryKey: [GET_IMAGE_STORAGE_USAGE_QUERY],
    queryFn: async (): Promise<ImageStorageUsage> => {
      return await adminService.getImageStorageUsage();
    },
  });
};
