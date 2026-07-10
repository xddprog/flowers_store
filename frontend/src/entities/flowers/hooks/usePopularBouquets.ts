import { useQuery } from "@tanstack/react-query";
import { bouquetService } from "../api/bouquetService";
import { BaseBouquet } from "../types/apiTypes";
import { GET_POPULAR_BOUQUETS_QUERY } from "../lib/queryKeys";

export const usePopularBouquets = () => {
  return useQuery({
    queryKey: [GET_POPULAR_BOUQUETS_QUERY],
    queryFn: async (): Promise<BaseBouquet[]> => {
      const response = await bouquetService.getPopularBouquets();
      return response;
    },
  });
};
