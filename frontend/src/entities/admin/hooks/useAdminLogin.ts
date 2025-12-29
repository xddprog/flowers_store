import { useMutation } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import { LoginDto, LoginResponse } from "../types/apiTypes";
import { LOGIN_MUTATION } from "../lib/queryKeys";

export const useAdminLogin = () => {
  return useMutation({
    mutationKey: [LOGIN_MUTATION],
    mutationFn: async (loginData: LoginDto): Promise<LoginResponse> => {
      const response = await adminService.login(loginData);
      return response;
    },
  });
};

