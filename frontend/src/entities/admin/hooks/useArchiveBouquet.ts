import { useMutation } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import { BaseBouquet } from "@/entities/flowers/types/apiTypes";
import { ARCHIVE_BOUQUET_MUTATION } from "../lib/queryKeys";

export const useArchiveBouquet = () => {
  return useMutation({
    mutationKey: [ARCHIVE_BOUQUET_MUTATION],
    mutationFn: async (bouquetId: string): Promise<BaseBouquet> => {
      const response = await adminService.archiveBouquet(bouquetId);
      return response;
    },
  });
};

