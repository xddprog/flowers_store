import { useMutation } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import { BaseBouquet } from "@/entities/flowers/types/apiTypes";
import { CreateBouquetDto } from "../types/apiTypes";
import { CREATE_BOUQUET_MUTATION } from "../lib/queryKeys";

export const useCreateBouquet = () => {
  return useMutation({
    mutationKey: [CREATE_BOUQUET_MUTATION],
    mutationFn: async (bouquetData: CreateBouquetDto): Promise<BaseBouquet> => {
      const response = await adminService.createBouquet(bouquetData);
      return response;
    },
  });
};

