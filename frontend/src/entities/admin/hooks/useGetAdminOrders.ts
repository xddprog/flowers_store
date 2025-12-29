import { useQuery } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import { AdminOrder, AdminOrderListParams } from "../types/apiTypes";
import { GET_ADMIN_ORDERS_QUERY } from "../lib/queryKeys";

export const useGetAdminOrders = (params?: AdminOrderListParams) => {
  return useQuery({
    queryKey: [GET_ADMIN_ORDERS_QUERY, params],
    queryFn: async (): Promise<AdminOrder[]> => {
      const response = await adminService.getOrders(params);
      return response;
    },
  });
};

