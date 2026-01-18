import { useMutation } from "@tanstack/react-query";
import { adminService } from "../api/adminService";
import { DELETE_BOUQUET_IMAGE_MUTATION } from "../lib/queryKeys";

export const useDeleteBouquetImage = () => {
    return useMutation({
        mutationKey: [DELETE_BOUQUET_IMAGE_MUTATION],
        mutationFn: async ({
            bouquetId,
            imageId,
        }: {
            bouquetId: string;
            imageId: string;
        }): Promise<void> => {
            await adminService.deleteBouquetImage(bouquetId, imageId);
        },
    });
};

