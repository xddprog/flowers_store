import { useQuery } from "@tanstack/react-query";
import { bouquetService } from "../api/bouquetService";
import { BouquetDetail } from "../types/apiTypes";
import { GET_BOUQUET_DETAIL_QUERY } from "../lib/queryKeys";

export const useBouquetDetail = (bouquetId: string) => {
  return useQuery({
    queryKey: [GET_BOUQUET_DETAIL_QUERY, bouquetId],
    queryFn: async (): Promise<BouquetDetail> => {
      const response = await bouquetService.getBouquetDetail(bouquetId);
      return response;
    },
    enabled: !!bouquetId,
  });
};

