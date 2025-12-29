import { useMutation } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import { BouquetImage } from "@/entities/flowers/types/apiTypes";
import { UpdateImageOrderDto } from "../types/apiTypes";
import { UPDATE_IMAGE_ORDER_MUTATION } from "../lib/queryKeys";

export const useUpdateImageOrder = () => {
  return useMutation({
    mutationKey: [UPDATE_IMAGE_ORDER_MUTATION],
    mutationFn: async ({
      bouquetId,
      imageId,
      orderData,
    }: {
      bouquetId: string;
      imageId: string;
      orderData: UpdateImageOrderDto;
    }): Promise<BouquetImage[]> => {
      const response = await adminService.updateImageOrder(
        bouquetId,
        imageId,
        orderData
      );
      return response;
    },
  });
};

