import { useQuery } from "@tanstack/react-query";
import { bouquetService } from "../api/bouquetService";
import { BaseBouquet, BouquetSearchParams } from "../types/apiTypes";
import { GET_BOUQUETS_SEARCH_QUERY } from "../lib/queryKeys";

export const useBouquetsSearch = (params: BouquetSearchParams) => {
  return useQuery({
    queryKey: [GET_BOUQUETS_SEARCH_QUERY, params],
    queryFn: async (): Promise<BaseBouquet[]> => {
      const response = await bouquetService.searchBouquets(params);
      return response;
    },
  });
};

