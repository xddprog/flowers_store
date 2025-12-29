import { useMutation } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import { DELETE_ORDER_MUTATION } from "../lib/queryKeys";

export const useDeleteOrder = () => {
  return useMutation({
    mutationKey: [DELETE_ORDER_MUTATION],
    mutationFn: async (orderId: string): Promise<string> => {
      const response = await adminService.deleteOrder(orderId);
      return response;
    },
  });
};

