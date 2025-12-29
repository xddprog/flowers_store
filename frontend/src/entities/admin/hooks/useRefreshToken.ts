import { useMutation } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import {
  RefreshTokenDto,
  RefreshTokenResponse,
} from "../types/apiTypes";
import { REFRESH_TOKEN_MUTATION } from "../lib/queryKeys";

export const useRefreshToken = () => {
  return useMutation({
    mutationKey: [REFRESH_TOKEN_MUTATION],
    mutationFn: async (
      refreshTokenData: RefreshTokenDto
    ): Promise<RefreshTokenResponse> => {
      const response = await adminService.refreshToken(refreshTokenData);
      return response;
    },
  });
};

