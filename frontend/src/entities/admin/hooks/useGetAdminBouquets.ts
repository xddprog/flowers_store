import { useQuery } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import { BaseBouquet } from "@/entities/flowers/types/apiTypes";
import { AdminBouquetListParams } from "../types/apiTypes";
import { GET_ADMIN_BOUQUETS_QUERY } from "../lib/queryKeys";

export const useGetAdminBouquets = (params?: AdminBouquetListParams) => {
  return useQuery({
    queryKey: [GET_ADMIN_BOUQUETS_QUERY, params],
    queryFn: async (): Promise<BaseBouquet[]> => {
      const response = await adminService.getBouquets(params);
      return response;
    },
  });
};

