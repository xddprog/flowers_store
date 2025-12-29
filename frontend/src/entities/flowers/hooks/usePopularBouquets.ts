import { useQuery } from "@tanstack/react-query";
import { bouquetService } from "../api/bouquetService";
import { BaseBouquet, PopularBouquetsParams } from "../types/apiTypes";
import { GET_POPULAR_BOUQUETS_QUERY } from "../lib/queryKeys";

export const usePopularBouquets = (params?: PopularBouquetsParams) => {
  return useQuery({
    queryKey: [GET_POPULAR_BOUQUETS_QUERY, params],
    queryFn: async (): Promise<BaseBouquet[]> => {
      const response = await bouquetService.getPopularBouquets(params);
      return response;
    },
  });
};

