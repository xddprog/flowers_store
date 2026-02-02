import { useQuery } from "@tanstack/react-query";
import { bouquetService } from "../api/bouquetService";
import { BaseBouquet } from "../types/apiTypes";
import { GET_POPULAR_BOUQUETS_QUERY } from "../lib/queryKeys";

const FETCH_ALL_LIMIT = 500;

export const usePopularBouquets = () => {
  return useQuery({
    queryKey: [GET_POPULAR_BOUQUETS_QUERY],
    queryFn: async (): Promise<BaseBouquet[]> => {
      const response = await bouquetService.getPopularBouquets({
        limit: FETCH_ALL_LIMIT,
        offset: 0,
      });
      return response;
    },
  });
};
