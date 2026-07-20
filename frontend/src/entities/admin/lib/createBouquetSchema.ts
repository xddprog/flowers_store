import { z } from "zod";

export const createBouquetSchema = z
  .object({
    name: z.string().min(1, "Название обязательно для заполнения"),
    description: z.string().min(1, "Описание обязательно для заполнения"),
    price: z.number().min(0, "Цена должна быть больше или равна 0"),
    price_to: z
      .number()
      .min(0, "Цена должна быть больше или равна 0")
      .nullable()
      .optional(),
    quantity: z.number().min(0, "Количество должно быть больше или равно 0"),
    bouquet_type_id: z.string().uuid("Выберите тип букета"),
    flower_type_ids: z
      .array(z.string().uuid())
      .min(1, "Выберите хотя бы один тип цветов"),
    images: z.array(z.instanceof(File)).optional(),
  })
  .refine((data) => data.price_to == null || data.price_to >= data.price, {
    message: "«Цена до» не может быть меньше «Цены от»",
    path: ["price_to"],
  });

export type CreateBouquetFormData = z.infer<typeof createBouquetSchema>;

