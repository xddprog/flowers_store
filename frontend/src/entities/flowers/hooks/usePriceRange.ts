import { useQuery } from "@tanstack/react-query";
import { bouquetService } from "../api/bouquetService";
import { queryKeys } from "../lib/queryKeys";

export const usePriceRange = () => {
  return useQuery({
    queryKey: queryKeys.priceRange(),
    queryFn: () => bouquetService.getPriceRange(),
  });
};

