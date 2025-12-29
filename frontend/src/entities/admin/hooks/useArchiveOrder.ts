import { useMutation } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import { AdminOrder } from "../types/apiTypes";
import { ARCHIVE_ORDER_MUTATION } from "../lib/queryKeys";

export const useArchiveOrder = () => {
  return useMutation({
    mutationKey: [ARCHIVE_ORDER_MUTATION],
    mutationFn: async (orderId: string): Promise<AdminOrder> => {
      const response = await adminService.archiveOrder(orderId);
      return response;
    },
  });
};

