import type { OrderFormData } from "./orderFormSchema";
import type { CreateOrderDto } from "@/entities/order/types/apiTypes";
import type { BasketItem } from "@/entities/product/types/types";

export const buildOrderDto = (
  formData: OrderFormData,
  items: BasketItem[],
  totalPrice: number
): CreateOrderDto => {
  const now = new Date();
  const deliveryDateValue = formData.deliveryDate
    ? new Date(formData.deliveryDate)
    : now;

  const [hoursFrom = 10, minutesFrom = 0] = formData.deliveryTimeFrom
    ? formData.deliveryTimeFrom.split(":").map(Number)
    : [10, 0];
  const [hoursTo = 11, minutesTo = 0] = formData.deliveryTimeTo
    ? formData.deliveryTimeTo.split(":").map(Number)
    : [11, 0];

  const deliveryTimeFromValue = new Date(deliveryDateValue);
  deliveryTimeFromValue.setHours(hoursFrom, minutesFrom, 0, 0);

  const deliveryTimeToValue = new Date(deliveryDateValue);
  deliveryTimeToValue.setHours(hoursTo, minutesTo, 0, 0);

  const dto: CreateOrderDto = {
    customer_name: formData.customerName.trim(),
    customer_phone: formData.customerPhone.replace(/\D/g, ""),
    customer_email: formData.customerEmail.trim(),
    is_pickup_by_customer: formData.deliveryType === "pickup",
    delivery_method: formData.deliveryType,
    items: items.map((item) => ({
      bouquet_id: item.product.id,
      title: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    })),
    payment_amount: totalPrice,
  };

  if (formData.recipientType === "other") {
    dto.recipient_name = formData.recipientName?.trim() || "";
    dto.recipient_phone = formData.recipientPhone?.replace(/\D/g, "") || "";
    if (formData.greetingCardText?.trim()) {
      dto.greeting_card_text = formData.greetingCardText.trim();
    }
  } else {
    dto.recipient_name = formData.customerName.trim();
    dto.recipient_phone = formData.customerPhone.replace(/\D/g, "");
  }

  if (formData.deliveryType === "delivery") {
    dto.delivery_date = deliveryDateValue.toISOString();
    dto.delivery_time_from = deliveryTimeFromValue.toISOString();
    dto.delivery_time_to = deliveryTimeToValue.toISOString();
    dto.delivery_city = formData.deliveryCity?.trim() || "";
    dto.delivery_street = formData.deliveryStreet?.trim() || "";
    dto.delivery_house = formData.deliveryHouse?.trim() || "";
    if (formData.deliveryApartment?.trim()) {
      dto.delivery_apartment = formData.deliveryApartment.trim();
    }
    if (formData.deliveryFloor?.trim()) {
      dto.delivery_floor = formData.deliveryFloor.trim();
    }
  }

  if (formData.comment?.trim()) {
    dto.comment = formData.comment.trim();
  }

  return dto;
};

