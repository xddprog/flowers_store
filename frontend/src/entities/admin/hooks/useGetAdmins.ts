import { useQuery } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import type { AdminListParams, AdminUser } from "../types/apiTypes";
import { GET_ADMINS_QUERY } from "../lib/queryKeys";

export const useGetAdmins = (params?: AdminListParams) => {
  return useQuery({
    queryKey: [GET_ADMINS_QUERY, params],
    queryFn: async (): Promise<AdminUser[]> => {
      const response = await adminService.getAdmins(params);
      return response;
    },
  });
};
