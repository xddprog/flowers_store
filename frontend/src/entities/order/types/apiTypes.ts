export interface OrderItem {
  bouquet_id: string;
  title: string;
  quantity: number;
  price: number;
}

export interface CreateOrderDto {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  is_pickup_by_customer: boolean;
  recipient_name?: string;
  recipient_phone?: string;
  greeting_card_text?: string;
  delivery_method: "delivery" | "pickup";
  delivery_date?: string;
  delivery_time_from?: string;
  delivery_time_to?: string;
  delivery_city?: string;
  delivery_street?: string;
  delivery_house?: string;
  delivery_apartment?: string;
  delivery_floor?: string;
  comment?: string;
  items: OrderItem[];
  payment_amount: number;
}

export interface CreateOrderResponse {
  payment_url: string;
}

