import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import {
  BLOCK_CUSTOMER_MUTATION,
  GET_ADMIN_CUSTOMERS_QUERY,
} from "../lib/queryKeys";

export const useBlockCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [BLOCK_CUSTOMER_MUTATION],
    mutationFn: async (email: string): Promise<void> => {
      await adminService.blockCustomer(email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GET_ADMIN_CUSTOMERS_QUERY],
      });
    },
  });
};

