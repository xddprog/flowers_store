import { Bouquet } from "@/entities/flowers/types/types";
import { Basket, BasketItem } from "../types/types";

const BASKET_STORAGE_KEY = "flowers-store-basket";

class BasketService {
  private getBasketFromStorage(): Basket {
    try {
      const stored = localStorage.getItem(BASKET_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Ошибка при чтении корзины из localStorage:", error);
    }
    return { items: [] };
  }

  private saveBasketToStorage(basket: Basket): void {
    try {
      localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(basket));
    } catch (error) {
      console.error("Ошибка при сохранении корзины в localStorage:", error);
    }
  }

  /**
   * Получить все товары из корзины
   */
  getBasket(): Basket {
    return this.getBasketFromStorage();
  }

  /**
   * Получить все элементы корзины
   */
  getItems(): BasketItem[] {
    return this.getBasketFromStorage().items;
  }

  /**
   * Добавить товар в корзину или увеличить количество, если товар уже есть
   */
  addItem(product: Bouquet, quantity: number = 1): void {
    const basket = this.getBasketFromStorage();
    const existingItemIndex = basket.items.findIndex(
      (item) => item.product.id === product.id
    );

    if (existingItemIndex >= 0) {
      basket.items[existingItemIndex].quantity += quantity;
    } else {
      basket.items.push({ product, quantity });
    }

    this.saveBasketToStorage(basket);
  }

  /**
   * Удалить товар из корзины
   */
  removeItem(productId: string): void {
    const basket = this.getBasketFromStorage();
    basket.items = basket.items.filter(
      (item) => item.product.id !== productId
    );
    this.saveBasketToStorage(basket);
  }

  /**
   * Обновить количество товара в корзине
   */
  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    const basket = this.getBasketFromStorage();
    const item = basket.items.find((item) => item.product.id === productId);

    if (item) {
      item.quantity = quantity;
      this.saveBasketToStorage(basket);
    }
  }

  /**
   * Получить количество конкретного товара в корзине
   */
  getItemQuantity(productId: string): number {
    const item = this.getItems().find(
      (item) => item.product.id === productId
    );
    return item?.quantity || 0;
  }

  /**
   * Получить общее количество товаров в корзине
   */
  getTotalItems(): number {
    return this.getItems().reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Получить общую стоимость корзины
   */
  getTotalPrice(): number {
    return this.getItems().reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }

  /**
   * Очистить корзину полностью
   */
  clearBasket(): void {
    this.saveBasketToStorage({ items: [] });
  }

  /**
   * Проверить, есть ли товар в корзине
   */
  hasItem(productId: string): boolean {
    return this.getItems().some((item) => item.product.id === productId);
  }
}

export const basketService = new BasketService();

