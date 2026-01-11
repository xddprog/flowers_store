import { useQuery } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import { AdminCustomer, AdminCustomerListParams } from "../types/apiTypes";
import { GET_ADMIN_CUSTOMERS_QUERY } from "../lib/queryKeys";

export const useGetAdminCustomers = (params?: AdminCustomerListParams) => {
  return useQuery({
    queryKey: [GET_ADMIN_CUSTOMERS_QUERY, params],
    queryFn: async (): Promise<AdminCustomer[]> => {
      const response = await adminService.getCustomers(params);
      return response;
    },
  });
};

