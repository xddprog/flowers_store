import { useMutation } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import { BouquetImage } from "@/entities/flowers/types/apiTypes";
import { UPLOAD_BOUQUET_IMAGES_MUTATION } from "../lib/queryKeys";

export const useUploadBouquetImages = () => {
  return useMutation({
    mutationKey: [UPLOAD_BOUQUET_IMAGES_MUTATION],
    mutationFn: async ({
      bouquetId,
      files,
    }: {
      bouquetId: string;
      files: File[];
    }): Promise<BouquetImage[]> => {
      const response = await adminService.uploadBouquetImages(bouquetId, files);
      return response;
    },
  });
};

