import { useMutation } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import { AdminOrder, UpdateOrderStatusDto } from "../types/apiTypes";
import { UPDATE_ORDER_STATUS_MUTATION } from "../lib/queryKeys";

export const useUpdateOrderStatus = () => {
  return useMutation({
    mutationKey: [UPDATE_ORDER_STATUS_MUTATION],
    mutationFn: async ({
      orderId,
      statusData,
    }: {
      orderId: string;
      statusData: UpdateOrderStatusDto;
    }): Promise<AdminOrder> => {
      const response = await adminService.updateOrderStatus(orderId, statusData);
      return response;
    },
  });
};

