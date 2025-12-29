import { useMutation } from "@tanstack/react-query";
import { orderService } from "../api/orderService";
import {
  CreateOrderDto,
  CreateOrderResponse,
} from "../types/apiTypes";
import { CREATE_ORDER_MUTATION } from "../lib/queryKeys";

export const useCreateOrder = () => {
  return useMutation({
    mutationKey: [CREATE_ORDER_MUTATION],
    mutationFn: async (orderData: CreateOrderDto): Promise<CreateOrderResponse> => {
      const response = await orderService.createOrder(orderData);
      return response;
    },
  });
};

