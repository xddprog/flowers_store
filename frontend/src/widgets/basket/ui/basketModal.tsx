import { useState, useEffect } from "react";
import { Image } from "@/shared/ui/image/image";
import { Dialog, DialogContent } from "@/shared/ui/dialog/dialog";
import { basketService } from "@/entities/product/lib/basketService";
import type { BasketItem } from "@/entities/product/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select/select";

interface BasketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabType = "contacts" | "delivery" | "payment";

export const BasketModal = ({ open, onOpenChange }: BasketModalProps) => {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("contacts");
  const [recipientType, setRecipientType] = useState<"customer" | "other">(
    "other"
  );
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">(
    "delivery"
  );

  useEffect(() => {
    if (open) {
      setItems(basketService.getItems());
    }
  }, [open]);

  const handleRemoveItem = (productId: string) => {
    basketService.removeItem(productId);
    setItems(basketService.getItems());
  };

  const totalPrice = basketService.getTotalPrice();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[1300px] h-[900px] px-12 gap-0 border-0 rounded-none sm:rounded-lg overflow-hidden flex flex-col"
        showCloseButton={false}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6">
            <h2 className="text-[56px] font-sans text-[#181818]">Корзина</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="text-[#181818] text-xl hover:opacity-70 transition-opacity"
            >
              ×
            </button>
          </div>
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab("contacts")}
              className={`pb-3 font-sans w-full text-start text-xl cursor-pointer text-black relative ${
                activeTab === "contacts"
                  ? "border-b-2 border-[#FF6600]"
                  : "border-b border-gray-200"
              }`}
            >
              Контакты
            </button>
            <button
              onClick={() => setActiveTab("delivery")}
              className={`pb-3 font-sans w-full text-start text-xl cursor-pointer text-black relative ${
                activeTab === "delivery"
                  ? "border-b-2 border-[#FF6600]"
                  : "border-b border-gray-200"
              }`}
            >
              Получение
            </button>
            <button
              onClick={() => setActiveTab("payment")}
              className={`pb-3 font-sans text-start text-xl w-full cursor-pointer text-black relative ${
                activeTab === "payment"
                  ? "border-b-2 border-[#FF6600]"
                  : "border-b border-gray-200"
              }`}
            >
              Оплата
            </button>
          </div>

          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            <div className="w-full p-6 overflow-y-auto flex flex-col h-full">
              {activeTab === "contacts" && (
                <div className="flex flex-col h-full">
                  <div>
                    <div className="mb-6">
                      <h3 className="text-[32px] font-sans font-medium text-[#181818] mb-4">
                        Заказчик
                      </h3>
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Имя"
                          className="w-full px-4 h-[52px] border border-black rounded-none font-sans text-base text-[#181818] focus:outline-none"
                        />
                        <div className="flex gap-4">
                          <input
                            type="tel"
                            placeholder="+7 (999) 999-99-99"
                            className="flex-1 px-4 h-[52px] border border-black rounded-none font-sans text-base text-[#181818] focus:outline-none"
                          />
                          <input
                            type="email"
                            placeholder="Почта"
                            className="flex-1 px-4 h-[52px] border border-black rounded-none font-sans text-base text-[#181818] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-[32px] font-sans font-medium text-[#181818] mb-4">
                        Получатель
                      </h3>
                      <div className="flex gap-4 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="recipient"
                            checked={recipientType === "customer"}
                            onChange={() => setRecipientType("customer")}
                            className="w-4 h-4 text-[#FF6600] focus:ring-[#FF6600]"
                          />
                          <span className="font-sans text-base text-[#181818]">
                            Заказчик
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="recipient"
                            checked={recipientType === "other"}
                            onChange={() => setRecipientType("other")}
                            className="w-4 h-4 text-[#FF6600] focus:ring-[#FF6600]"
                          />
                          <span className="font-sans text-base text-[#181818]">
                            Другое лицо
                          </span>
                        </label>
                      </div>
                      {recipientType === "other" && (
                        <div className="space-y-4">
                          <input
                            type="text"
                            placeholder="Имя получателя"
                            className="w-full px-4 h-[52px] border border-black rounded-none font-sans text-base text-[#181818] focus:outline-none"
                          />
                          <div className="flex gap-4">
                            <input
                              type="tel"
                              placeholder="+7 (999) 999-99-99"
                              className="flex-1 px-4 h-[52px] border border-black rounded-none font-sans text-base text-[#181818] focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Текст открытки"
                              className="flex-1 px-4 h-[52px] border border-black rounded-none font-sans text-base text-[#181818] focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("delivery")}
                    className="w-full bg-[#FF6600] text-white font-sans text-lg font-medium h-[60px] px-6 rounded-none hover:opacity-90 transition-opacity mt-auto"
                  >
                    Далее
                  </button>
                </div>
              )}

              {activeTab === "delivery" && (
                <div className="flex flex-col h-full">
                  <div>
                    <div className="mb-6">
                      <h3 className="text-[32px] font-sans font-medium text-[#181818] mb-4">
                        Способ получения
                      </h3>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="delivery"
                            checked={deliveryType === "delivery"}
                            onChange={() => setDeliveryType("delivery")}
                            className="w-4 h-4 text-[#FF6600] focus:ring-[#FF6600]"
                          />
                          <span className="font-sans text-base text-[#181818]">
                            Доставка
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="delivery"
                            checked={deliveryType === "pickup"}
                            onChange={() => setDeliveryType("pickup")}
                            className="w-4 h-4 text-[#FF6600] focus:ring-[#FF6600]"
                          />
                          <span className="font-sans text-base text-[#181818]">
                            Самовывоз
                          </span>
                        </label>
                      </div>
                    </div>

                    {deliveryType === "delivery" && (
                      <>
                        <div className="mb-6">
                          <h3 className="text-[32px] font-sans font-medium text-[#181818] mb-4">
                            Дата и время доставки
                          </h3>
                          <div className="flex gap-4">
                            <Select defaultValue="today">
                              <SelectTrigger className="flex-1 px-4 min-h-[52px] h-[52px] border border-black rounded-none font-sans text-base text-[#181818] focus:outline-none bg-white shadow-none w-full py-0">
                                <SelectValue placeholder="Сегодня, 10 ноября" />
                              </SelectTrigger>
                              <SelectContent
                                side="bottom"
                                align="start"
                                position="popper"
                              >
                                <SelectItem value="today">
                                  Сегодня, 10 ноября
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <Select defaultValue="time1">
                              <SelectTrigger className="flex-1 px-4 min-h-[52px] h-[52px] border border-black rounded-none font-sans text-base text-[#181818] focus:outline-none bg-white shadow-none w-full py-0">
                                <SelectValue placeholder="С 10:00 до 11:00" />
                              </SelectTrigger>
                              <SelectContent
                                side="bottom"
                                align="start"
                                position="popper"
                              >
                                <SelectItem value="time1">
                                  С 10:00 до 11:00
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="mb-6">
                          <h3 className="text-[32px] font-sans font-medium text-[#181818] mb-4">
                            Адрес доставки
                          </h3>
                          <div className="space-y-4">
                            <Select defaultValue="moscow">
                              <SelectTrigger className="w-full px-4 h-[52px] min-h-[52px]  border border-black rounded-none font-sans text-base text-[#181818] focus:outline-none bg-white shadow-none">
                                <SelectValue placeholder="Москва" />
                              </SelectTrigger>
                              <SelectContent
                                side="bottom"
                                align="start"
                                position="popper"
                              >
                                <SelectItem value="moscow">Москва</SelectItem>
                              </SelectContent>
                            </Select>
                            <input
                              type="text"
                              placeholder="Улица"
                              className="w-full px-4 h-[52px] border border-black rounded-none font-sans text-base text-[#181818] focus:outline-none"
                            />
                            <div className="flex gap-4">
                              <input
                                type="text"
                                placeholder="Дом"
                                className="flex-1 px-4 h-[52px] border border-black rounded-none font-sans text-base text-[#181818] focus:outline-none"
                              />
                              <input
                                type="text"
                                placeholder="Квартира"
                                className="flex-1 px-4 h-[52px] border border-black rounded-none font-sans text-base text-[#181818] focus:outline-none"
                              />
                              <input
                                type="text"
                                placeholder="Этаж"
                                className="flex-1 px-4 h-[52px] border border-black rounded-none font-sans text-base text-[#181818] focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveTab("payment")}
                    className="w-full bg-[#FF6600] text-white font-sans text-lg font-medium h-[60px] px-6 rounded-none hover:opacity-90 transition-opacity mt-auto"
                  >
                    Далее
                  </button>
                </div>
              )}

              {activeTab === "payment" && (
                <div className="flex flex-col h-full">
                  <div>
                    <h3 className="text-[32px] font-sans font-medium text-[#181818] mb-4">
                      Пожелания
                    </h3>
                    <textarea
                      placeholder="Комментарий к заказу"
                      rows={4}
                      className="w-full px-4 py-2 border border-black rounded-none font-sans text-base text-[#181818] focus:outline-none resize-none"
                    />
                  </div>
                  <button className="w-full bg-[#FF6600] text-white font-sans text-lg font-medium h-[60px] px-6 rounded-none hover:opacity-90 transition-opacity mt-auto">
                    Оплатить
                  </button>
                </div>
              )}
            </div>

            <div className="min-w-[438px] p-6 overflow-y-auto">
              <h3 className="text-[32px] font-sans font-medium text-[#181818] mb-6">
                Ваш заказ
              </h3>

              {items.length === 0 ? (
                <p className="text-base font-sans text-[#181818] text-center py-8">
                  Корзина пуста
                </p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center gap-4 bg-white p-4 rounded"
                      >
                        <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0">
                          {item.product.image ? (
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-sans text-base text-[#181818] mb-1">
                            {item.product.name}
                          </h4>
                          <p className="font-sans text-base font-semibold text-[#FF6600]">
                            {item.product.price} Р
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.product.id)}
                          className="text-[#181818] hover:opacity-70 transition-opacity text-xl"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-300 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-sans text-base text-[#181818]">
                        Итоговая сумма:
                      </span>
                      <span className="font-sans text-lg font-semibold text-[#181818]">
                        {totalPrice} Р
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
