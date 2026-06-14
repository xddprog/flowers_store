import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import type { AdminUser, UpdateAdminDto } from "../types/apiTypes";
import {
  GET_ADMINS_QUERY,
  GET_CURRENT_USER_QUERY,
  UPDATE_ADMIN_MUTATION,
} from "../lib/queryKeys";

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [UPDATE_ADMIN_MUTATION],
    mutationFn: async ({
      adminId,
      adminData,
    }: {
      adminId: string;
      adminData: UpdateAdminDto;
    }): Promise<AdminUser> => {
      const response = await adminService.updateAdmin(adminId, adminData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_ADMINS_QUERY] });
      queryClient.invalidateQueries({ queryKey: [GET_CURRENT_USER_QUERY] });
    },
  });
};
