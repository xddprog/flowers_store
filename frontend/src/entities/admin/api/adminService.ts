import queryString from "query-string";
import { axiosAuth, axiosNoAuth } from "@/shared/api/baseQueryInstance";
import {
  BaseBouquet,
  BouquetDetail,
  BouquetImage,
} from "@/entities/flowers/types/apiTypes";
import {
  LoginDto,
  LoginResponse,
  CurrentUserResponse,
  RefreshTokenDto,
  RefreshTokenResponse,
  AdminBouquetListParams,
  CreateBouquetDto,
  UpdateBouquetDto,
  UpdateImageOrderDto,
  AdminOrderListParams,
  AdminOrder,
  UpdateOrderStatusDto,
} from "../types/apiTypes";

class AdminService {
  public async login(loginData: LoginDto): Promise<LoginResponse> {
    const { data } = await axiosNoAuth.post<LoginResponse>(
      "/admin/auth/login",
      loginData as unknown as Record<string, unknown>
    );
    return data;
  }

  public async getCurrentUser(): Promise<CurrentUserResponse> {
    const { data } = await axiosAuth.get<CurrentUserResponse>(
      "/admin/auth/current_user"
    );
    return data;
  }

  public async refreshToken(
    refreshTokenData: RefreshTokenDto
  ): Promise<RefreshTokenResponse> {
    const { data } = await axiosAuth.post<RefreshTokenResponse>(
      "/admin/auth/refresh",
      refreshTokenData as unknown as Record<string, unknown>
    );
    return data;
  }

  public async getBouquets(
    params?: AdminBouquetListParams
  ): Promise<BaseBouquet[]> {
    const queryParams = queryString.stringify(
      {
        limit: params?.limit ?? 10,
        offset: params?.offset ?? 0,
      },
      {
        skipNull: true,
        skipEmptyString: true,
      }
    );

    const url = `/admin/bouquet/${queryParams ? `?${queryParams}` : ""}`;
    const { data } = await axiosAuth.get<BaseBouquet[]>(url);
    return data;
  }

  public async getBouquetDetail(bouquetId: string): Promise<BouquetDetail> {
    const { data } = await axiosAuth.get<BouquetDetail>(
      `/admin/bouquet/${bouquetId}`
    );
    return data;
  }

  public async createBouquet(
    bouquetData: CreateBouquetDto
  ): Promise<BaseBouquet> {
    const { data } = await axiosAuth.post<BaseBouquet>(
      "/admin/bouquet/",
      bouquetData as unknown as Record<string, unknown>
    );
    return data;
  }

  public async updateBouquet(
    bouquetId: string,
    bouquetData: UpdateBouquetDto
  ): Promise<BaseBouquet> {
    const { data } = await axiosAuth.put<BaseBouquet>(
      `/admin/bouquet/${bouquetId}`,
      bouquetData as unknown as Record<string, unknown>
    );
    return data;
  }

  public async deleteBouquet(bouquetId: string): Promise<string> {
    const { data } = await axiosAuth.delete<string>(
      `/admin/bouquet/${bouquetId}`
    );
    return data;
  }

  public async archiveBouquet(bouquetId: string): Promise<BaseBouquet> {
    const { data } = await axiosAuth.post<BaseBouquet>(
      `/admin/bouquet/${bouquetId}/archive`
    );
    return data;
  }

  public async uploadBouquetImages(
    bouquetId: string,
    files: File[]
  ): Promise<BouquetImage[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const { data } = await axiosAuth.post<BouquetImage[]>(
      `/admin/bouquet/${bouquetId}/images`,
      formData as unknown as Record<string, unknown>
    );
    return data;
  }

  public async updateImageOrder(
    bouquetId: string,
    imageId: string,
    orderData: UpdateImageOrderDto
  ): Promise<BouquetImage[]> {
    const { data } = await axiosAuth.patch<BouquetImage[]>(
      `/admin/bouquet/${bouquetId}/images/${imageId}/order`,
      orderData as unknown as Record<string, unknown>
    );
    return data;
  }

  public async getOrders(params?: AdminOrderListParams): Promise<AdminOrder[]> {
    const queryParams = queryString.stringify(
      {
        limit: params?.limit ?? 10,
        offset: params?.offset ?? 0,
      },
      {
        skipNull: true,
        skipEmptyString: true,
      }
    );

    const url = `/admin/order/${queryParams ? `?${queryParams}` : ""}`;
    const { data } = await axiosAuth.get<AdminOrder[]>(url);
    return data;
  }

  public async updateOrderStatus(
    orderId: string,
    statusData: UpdateOrderStatusDto
  ): Promise<AdminOrder> {
    const { data } = await axiosAuth.patch<AdminOrder>(
      `/admin/order/${orderId}/status`,
      statusData as unknown as Record<string, unknown>
    );
    return data;
  }

  public async deleteOrder(orderId: string): Promise<string> {
    const { data } = await axiosAuth.delete<string>(`/admin/order/${orderId}`);
    return data;
  }

  public async archiveOrder(orderId: string): Promise<AdminOrder> {
    const { data } = await axiosAuth.post<AdminOrder>(
      `/admin/order/${orderId}/archive`
    );
    return data;
  }
}

export const adminService = new AdminService();
