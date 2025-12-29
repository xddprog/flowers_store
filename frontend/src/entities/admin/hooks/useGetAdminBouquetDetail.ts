import { useQuery } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import { BouquetDetail } from "@/entities/flowers/types/apiTypes";
import { GET_ADMIN_BOUQUET_DETAIL_QUERY } from "../lib/queryKeys";

export const useGetAdminBouquetDetail = (bouquetId: string) => {
  return useQuery({
    queryKey: [GET_ADMIN_BOUQUET_DETAIL_QUERY, bouquetId],
    queryFn: async (): Promise<BouquetDetail> => {
      const response = await adminService.getBouquetDetail(bouquetId);
      return response;
    },
    enabled: !!bouquetId,
  });
};

