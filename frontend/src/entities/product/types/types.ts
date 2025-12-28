import { Bouquet } from "@/entities/flowers/types/types";

export interface BasketItem {
  product: Bouquet;
  quantity: number;
}

export interface Basket {
  items: BasketItem[];
}

