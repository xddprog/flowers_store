import { BaseBouquet } from "@/entities/flowers/types/apiTypes";
import { useMutation } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import { CREATE_BOUQUET_MUTATION } from "../lib/queryKeys";
import { CreateBouquetDto } from "../types/apiTypes";

export const useCreateBouquet = () => {
  return useMutation({
    mutationKey: [CREATE_BOUQUET_MUTATION],
    mutationFn: async (data: { bouquetData: CreateBouquetDto; files?: File[] }): Promise<BaseBouquet> => {
      const response = await adminService.createBouquet(data.bouquetData, data.files);
      return response;
    },
  });
};

