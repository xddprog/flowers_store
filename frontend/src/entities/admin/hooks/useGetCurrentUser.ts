import { useQuery } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import { CurrentUserResponse } from "../types/apiTypes";
import { GET_CURRENT_USER_QUERY } from "../lib/queryKeys";

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [GET_CURRENT_USER_QUERY],
    queryFn: async (): Promise<CurrentUserResponse> => {
      const response = await adminService.getCurrentUser();
      return response;
    },
  });
};

