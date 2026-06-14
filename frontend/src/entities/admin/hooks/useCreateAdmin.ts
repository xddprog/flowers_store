import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import type { AdminUser, CreateAdminDto } from "../types/apiTypes";
import { CREATE_ADMIN_MUTATION, GET_ADMINS_QUERY } from "../lib/queryKeys";

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [CREATE_ADMIN_MUTATION],
    mutationFn: async (adminData: CreateAdminDto): Promise<AdminUser> => {
      const response = await adminService.createAdmin(adminData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_ADMINS_QUERY] });
    },
  });
};
