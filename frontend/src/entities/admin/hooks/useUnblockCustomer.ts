import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import {
  UNBLOCK_CUSTOMER_MUTATION,
  GET_ADMIN_CUSTOMERS_QUERY,
} from "../lib/queryKeys";

export const useUnblockCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [UNBLOCK_CUSTOMER_MUTATION],
    mutationFn: async (email: string): Promise<void> => {
      await adminService.unblockCustomer(email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GET_ADMIN_CUSTOMERS_QUERY],
      });
    },
  });
};

