import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import { DELETE_ADMIN_MUTATION, GET_ADMINS_QUERY } from "../lib/queryKeys";

export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [DELETE_ADMIN_MUTATION],
    mutationFn: async (adminId: string): Promise<void> => {
      await adminService.deleteAdmin(adminId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_ADMINS_QUERY] });
    },
  });
};
