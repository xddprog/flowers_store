import { axiosNoAuth } from "@/shared/api/baseQueryInstance";
import { CreateOrderDto, CreateOrderResponse } from "../types/apiTypes";

class OrderService {
  public async createOrder(
    orderData: CreateOrderDto
  ): Promise<CreateOrderResponse> {
    const { data } = await axiosNoAuth.post<CreateOrderResponse>(
      "/api/v1/order/",
      orderData as unknown as Record<string, unknown>
    );
    return data;
  }
}

export const orderService = new OrderService();
