import { useMutation } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import { BaseBouquet } from "@/entities/flowers/types/apiTypes";
import { UpdateBouquetDto } from "../types/apiTypes";
import { UPDATE_BOUQUET_MUTATION } from "../lib/queryKeys";

export const useUpdateBouquet = () => {
  return useMutation({
    mutationKey: [UPDATE_BOUQUET_MUTATION],
    mutationFn: async ({
      bouquetId,
      bouquetData,
    }: {
      bouquetId: string;
      bouquetData: UpdateBouquetDto;
    }): Promise<BaseBouquet> => {
      const response = await adminService.updateBouquet(bouquetId, bouquetData);
      return response;
    },
  });
};

