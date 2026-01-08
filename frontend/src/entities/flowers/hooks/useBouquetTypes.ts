import { useQuery } from "@tanstack/react-query";
import { bouquetService } from "../api/bouquetService";
import { BouquetType } from "../types/apiTypes";
import { GET_BOUQUET_TYPES_QUERY } from "../lib/queryKeys";

export const useBouquetTypes = () => {
  return useQuery({
    queryKey: [GET_BOUQUET_TYPES_QUERY],
    queryFn: async (): Promise<BouquetType[]> => {
      const response = await bouquetService.getBouquetTypes();
      return response;
    },
  });
};

