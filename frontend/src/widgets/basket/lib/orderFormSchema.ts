import { z } from "zod";

export const orderFormSchema = z
  .object({
    customerName: z.string().min(1, "Имя заказчика обязательно"),
    customerPhone: z
      .string()
      .min(1, "Телефон заказчика обязателен")
      .refine(
        (phone) => phone.replace(/\D/g, "").length >= 11,
        "Введите корректный номер телефона"
      ),
    customerEmail: z
      .string()
      .min(1, "Email заказчика обязателен")
      .email("Введите корректный email"),
    recipientType: z.enum(["customer", "other"]),
    recipientName: z.string().optional(),
    recipientPhone: z.string().optional(),
    greetingCardText: z.string().optional(),
    deliveryType: z.enum(["delivery", "pickup"]),
    deliveryDate: z.string().optional(),
    deliveryTimeFrom: z.string().optional(),
    deliveryTimeTo: z.string().optional(),
    deliveryCity: z.string().optional(),
    deliveryStreet: z.string().optional(),
    deliveryHouse: z.string().optional(),
    deliveryApartment: z.string().optional(),
    deliveryFloor: z.string().optional(),
    comment: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.recipientType === "other") {
        return !!data.recipientName && data.recipientName.trim().length > 0;
      }
      return true;
    },
    {
      message: "Имя получателя обязательно",
      path: ["recipientName"],
    }
  )
  .refine(
    (data) => {
      if (data.recipientType === "other") {
        return (
          !!data.recipientPhone &&
          data.recipientPhone.replace(/\D/g, "").length >= 11
        );
      }
      return true;
    },
    {
      message: "Введите корректный номер телефона получателя",
      path: ["recipientPhone"],
    }
  )
  .refine(
    (data) => {
      if (data.deliveryType === "delivery") {
        return !!data.deliveryDate && data.deliveryDate.length > 0;
      }
      return true;
    },
    {
      message: "Выберите дату доставки",
      path: ["deliveryDate"],
    }
  )
  .refine(
    (data) => {
      if (data.deliveryType === "delivery") {
        return !!data.deliveryTimeFrom && data.deliveryTimeFrom.length > 0;
      }
      return true;
    },
    {
      message: "Выберите время доставки",
      path: ["deliveryTimeFrom"],
    }
  )
  .refine(
    (data) => {
      if (data.deliveryType === "delivery") {
        return !!data.deliveryCity && data.deliveryCity.trim().length > 0;
      }
      return true;
    },
    {
      message: "Город обязателен",
      path: ["deliveryCity"],
    }
  )
  .refine(
    (data) => {
      if (data.deliveryType === "delivery") {
        return !!data.deliveryStreet && data.deliveryStreet.trim().length > 0;
      }
      return true;
    },
    {
      message: "Улица обязательна",
      path: ["deliveryStreet"],
    }
  )
  .refine(
    (data) => {
      if (data.deliveryType === "delivery") {
        return !!data.deliveryHouse && data.deliveryHouse.trim().length > 0;
      }
      return true;
    },
    {
      message: "Дом обязателен",
      path: ["deliveryHouse"],
    }
  );

export type OrderFormData = z.infer<typeof orderFormSchema>;

