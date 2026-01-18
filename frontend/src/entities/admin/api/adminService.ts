import {
  BaseBouquet,
  BouquetDetail,
  BouquetImage,
} from "@/entities/flowers/types/apiTypes";
import { axiosAuth, axiosNoAuth } from "@/shared/api/baseQueryInstance";
import queryString from "query-string";
import {
  AdminBouquetListParams,
  AdminCustomer,
  AdminCustomerListParams,
  AdminOrder,
  AdminOrderListParams,
  CreateBouquetDto,
  CurrentUserResponse,
  LoginDto,
  LoginResponse,
  RefreshTokenDto,
  RefreshTokenResponse,
  UpdateBouquetDto,
  UpdateImageOrderDto,
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
    bouquetData: CreateBouquetDto,
    files?: File[]
  ): Promise<BaseBouquet> {
    const formData = new FormData();
    formData.append("name", bouquetData.name);
    formData.append("description", bouquetData.description);
    formData.append("price", bouquetData.price.toString());
    formData.append("quantity", bouquetData.quantity.toString());
    formData.append("bouquet_type_id", bouquetData.bouquet_type_id);

    if (bouquetData.flower_type_ids && bouquetData.flower_type_ids.length > 0) {
      formData.append("flower_type_ids", JSON.stringify(bouquetData.flower_type_ids));
    }

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("images", file);
      });
    }

    const { data } = await axiosAuth.post<BaseBouquet>(
      "/admin/bouquet/",
      formData as unknown as Record<string, unknown>,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
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

  public async deleteBouquetImage(
    bouquetId: string,
    imageId: string
  ): Promise<void> {
    await axiosAuth.delete(`/admin/bouquet/${bouquetId}/images/${imageId}`);
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

  public async getCustomers(
    params?: AdminCustomerListParams
  ): Promise<AdminCustomer[]> {
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

    const url = `/admin/customer/${queryParams ? `?${queryParams}` : ""}`;
    const { data } = await axiosAuth.get<AdminCustomer[]>(url);
    return data;
  }

  public async blockCustomer(email: string): Promise<void> {
    await axiosAuth.post(`/admin/customer/${email}/block`);
  }

  public async unblockCustomer(email: string): Promise<void> {
    await axiosAuth.post(`/admin/customer/${email}/unblock`);
  }
}

export const adminService = new AdminService();
