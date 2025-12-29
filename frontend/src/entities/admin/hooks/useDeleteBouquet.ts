import { useMutation } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import { DELETE_BOUQUET_MUTATION } from "../lib/queryKeys";

export const useDeleteBouquet = () => {
  return useMutation({
    mutationKey: [DELETE_BOUQUET_MUTATION],
    mutationFn: async (bouquetId: string): Promise<string> => {
      const response = await adminService.deleteBouquet(bouquetId);
      return response;
    },
  });
};

