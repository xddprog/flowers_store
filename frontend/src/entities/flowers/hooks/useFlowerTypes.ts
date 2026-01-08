import { useQuery } from "@tanstack/react-query";
import { bouquetService } from "../api/bouquetService";
import { FlowerType } from "../types/apiTypes";
import { GET_FLOWER_TYPES_QUERY } from "../lib/queryKeys";

export const useFlowerTypes = () => {
  return useQuery({
    queryKey: [GET_FLOWER_TYPES_QUERY],
    queryFn: async (): Promise<FlowerType[]> => {
      const response = await bouquetService.getFlowerTypes();
      return response;
    },
  });
};

