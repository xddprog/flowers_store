import { z } from "zod";

export const updateBouquetSchema = z.object({
  name: z.string().min(1, "Название обязательно для заполнения"),
  description: z.string().min(1, "Описание обязательно для заполнения"),
  price: z.number().min(0, "Цена должна быть больше или равна 0"),
  bouquet_type_id: z.string().uuid("Выберите тип букета"),
  flower_type_ids: z
    .array(z.string().uuid())
    .min(1, "Выберите хотя бы один тип цветов"),
});

export type UpdateBouquetFormData = z.infer<typeof updateBouquetSchema>;
