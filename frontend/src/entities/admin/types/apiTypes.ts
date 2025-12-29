export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface CurrentUserResponse {
  id: string;
  username: string;
}

export interface RefreshTokenDto {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface AdminBouquetListParams {
  limit?: number;
  offset?: number;
}

export interface CreateBouquetDto {
  name: string;
  description: string;
  price: number;
  bouquet_type_id: string;
  flower_type_ids: string[];
}

export interface UpdateBouquetDto {
  name: string;
  description: string;
  price: number;
  bouquet_type_id: string;
  flower_type_ids: string[];
}

export interface UpdateImageOrderDto {
  order: number;
}

export interface AdminOrderListParams {
  limit?: number;
  offset?: number;
}

export interface AdminOrder {
  id: string;
  customer_email: string;
  customer_phone: string;
  recipient_name: string;
  recipient_phone: string;
  delivery_city: string;
  delivery_street: string;
  delivery_house: string;
  delivery_apartment: string;
  delivery_floor: string;
  total_amount: number;
  status: string;
  is_active: boolean;
  created_at: string;
}

export interface UpdateOrderStatusDto {
  status: string;
}

