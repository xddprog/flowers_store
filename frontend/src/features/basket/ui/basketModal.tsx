import { useCreateOrder } from "@/entities/order/hooks/useCreateOrder";
import { basketService } from "@/entities/product/lib/basketService";
import type { BasketItem } from "@/entities/product/types/types";
import { cn } from "@/shared/lib/mergeClass";
import { Dialog, DialogContent } from "@/shared/ui/dialog/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/ui/form/form";
import { Image } from "@/shared/ui/image/image";
import { Input } from "@/shared/ui/input/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select/select";
import { Textarea } from "@/shared/ui/textarea/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { buildOrderDto } from "../lib/buildOrderDto";
import {
  cities,
  getDeliveryDateOptions,
  getDeliveryTimeSlots,
  parseTimeSlot,
} from "../lib/deliveryOptions";
import { formatPhoneNumber } from "../lib/formatPhoneNumber";
import { orderFormSchema, type OrderFormData } from "../lib/orderFormSchema";

interface BasketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabType = "contacts" | "delivery" | "payment";

export const BasketModal = ({ open, onOpenChange }: BasketModalProps) => {
  const storePhone = "8 (800) 600-69-29";
  const storePhoneHref = "tel:88006006929";
  const [items, setItems] = useState<BasketItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("contacts");
  const [apiError, setApiError] = useState<string>("");
  const [hasPackaging, setHasPackaging] = useState(false);

  const { mutate: createOrder, isPending } = useCreateOrder();

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      recipientType: "other",
      recipientName: "",
      recipientPhone: "",
      greetingCardText: "",
      deliveryType: "delivery",
      deliveryDate: "",
      deliveryTimeFrom: "",
      deliveryTimeTo: "",
      deliveryCity: "",
      deliveryStreet: "",
      deliveryHouse: "",
      deliveryApartment: "",
      deliveryFloor: "",
      comment: "",
    },
  });

  const recipientType = form.watch("recipientType");
  const deliveryType = form.watch("deliveryType");

  useEffect(() => {
    if (open) {
      setItems(basketService.getItems());
      setApiError("");
      form.reset();
      const currentTotal = basketService.getTotalPrice();
      setHasPackaging(currentTotal >= FREE_PACKAGING_THRESHOLD);
    }
  }, [open, form]);

  const handleRemoveItem = (productId: string) => {
    basketService.removeItem(productId);
    setItems(basketService.getItems());
  };

  const PACKAGING_PRICE = 300;
  const FREE_PACKAGING_THRESHOLD = 8000;

  const bouquetTotal = basketService.getTotalPrice();
  const isPackagingFree = bouquetTotal >= FREE_PACKAGING_THRESHOLD;
  const packagingPrice = hasPackaging && !isPackagingFree ? PACKAGING_PRICE : 0;
  const totalPrice = bouquetTotal + packagingPrice;
  const hasOnOrderItems = items.some(
    (item) => item.product.availability_status === "on_order"
  );

  const handleNextTab = async (nextTab: TabType) => {
    let fieldsToValidate: (keyof OrderFormData)[];

    if (nextTab === "delivery") {
      fieldsToValidate = [
        "customerName",
        "customerPhone",
        "customerEmail",
        "recipientType",
      ];
      if (recipientType === "other") {
        fieldsToValidate.push("recipientName", "recipientPhone");
      }
    } else {
      fieldsToValidate = [
        "deliveryDate",
        "deliveryTimeFrom",
        "deliveryCity",
        "deliveryStreet",
        "deliveryHouse",
      ];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setActiveTab(nextTab);
    }
  };

  const onSubmit = async (data: OrderFormData) => {
    if (items.length === 0) {
      setApiError("Корзина пуста");
      setActiveTab("contacts");
      return;
    }
    if (hasOnOrderItems) {
      setApiError(
        `В корзине есть позиции под заказ. Для оформления свяжитесь с магазином: ${storePhone}`
      );
      setActiveTab("payment");
      return;
    }

    const orderDto = buildOrderDto(data, items, totalPrice, hasPackaging || isPackagingFree);

    createOrder(orderDto, {
      onSuccess: (response) => {
        basketService.clearBasket();
        setItems([]);
        onOpenChange(false);
        setApiError("");
        form.reset();

        // Открываем ссылку на оплату в новом окне
        if (response.payment_url) {
          window.open(response.payment_url, "_blank");
        }
      },
      onError: (error: unknown) => {
        if (error instanceof AxiosError) {
          const errorMessage =
            error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "Произошла ошибка при создании заказа";
          setApiError(errorMessage);
        } else if (error instanceof Error) {
          setApiError(error.message);
        } else {
          setApiError("Произошла неизвестная ошибка");
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[1300px] w-full h-[100dvh] max-h-[100dvh] p-0 gap-0 border-0 rounded-none overflow-hidden flex flex-col lg:h-[min(900px,calc(100dvh-2rem))] lg:max-h-[calc(100dvh-2rem)] lg:px-12"
        showCloseButton={false}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full min-h-0"
          >
            <div className="flex flex-col h-full min-h-0">
              <div className="flex shrink-0 items-center justify-between p-4 md:p-5 lg:p-6">
                <h2 className="text-2xl md:text-4xl lg:text-[56px] font-sans text-[#181818]">
                  Корзина
                </h2>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="text-[#181818] text-2xl md:text-3xl lg:text-xl hover:opacity-70 transition-opacity leading-none"
                  aria-label="Закрыть"
                >
                  ×
                </button>
              </div>
              <div className="flex shrink-0 px-4 md:px-5 lg:px-6 overflow-x-auto min-h-[35px]">
                <button
                  type="button"
                  onClick={() => setActiveTab("contacts")}
                  className={`pb-2 md:pb-3 font-sans w-full text-start text-base md:text-lg lg:text-xl cursor-pointer text-black relative whitespace-nowrap ${activeTab === "contacts"
                    ? "border-b-2 border-[#FF6600]"
                    : "border-b border-gray-200"
                    }`}
                >
                  Контакты
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("delivery")}
                  className={`pb-2 md:pb-3 font-sans w-full text-start text-base md:text-lg lg:text-xl cursor-pointer text-black relative whitespace-nowrap ${activeTab === "delivery"
                    ? "border-b-2 border-[#FF6600]"
                    : "border-b border-gray-200"
                    }`}
                >
                  Получение
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("payment")}
                  className={`pb-2 md:pb-3 font-sans text-start text-base md:text-lg lg:text-xl w-full cursor-pointer text-black relative whitespace-nowrap ${activeTab === "payment"
                    ? "border-b-2 border-[#FF6600]"
                    : "border-b border-gray-200"
                    }`}
                >
                  Оплата
                </button>
              </div>

              <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-y-auto overflow-x-hidden lg:overflow-hidden pb-4 lg:pb-0">
                <div className="w-full min-w-0 shrink-0 p-4 md:p-5 lg:p-6 flex flex-col lg:flex-1 lg:min-h-0 lg:h-full lg:overflow-y-auto">
                  {activeTab === "contacts" && (
                    <div className="flex flex-col lg:h-full lg:min-h-0">
                      <div>
                        <div className="mb-4 md:mb-6">
                          <h3 className="text-xl md:text-2xl lg:text-[32px] font-sans font-medium text-[#181818] mb-3 md:mb-4">
                            Заказчик
                          </h3>
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="customerName"
                              render={({ field, fieldState }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      placeholder="Имя"
                                      className={cn(
                                        "w-full px-3 md:px-4 h-[48px] md:h-[52px] border rounded-none font-sans text-sm md:text-base text-[#181818] focus:outline-none",
                                        fieldState.error
                                          ? "border-red-500"
                                          : "border-black"
                                      )}
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <div className="flex flex-col md:flex-row gap-4">
                              <FormField
                                control={form.control}
                                name="customerPhone"
                                render={({ field, fieldState }) => (
                                  <FormItem className="flex-1">
                                    <FormControl>
                                      <Input
                                        type="tel"
                                        placeholder="+7 (999) 999-99-99"
                                        className={cn(
                                          "w-full px-3 md:px-4 h-[48px] md:h-[52px] border rounded-none font-sans text-sm md:text-base text-[#181818] focus:outline-none",
                                          fieldState.error
                                            ? "border-red-500"
                                            : "border-black"
                                        )}
                                        {...field}
                                        onChange={(e) => {
                                          const formatted = formatPhoneNumber(
                                            e.target.value
                                          );
                                          field.onChange(formatted);
                                        }}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="customerEmail"
                                render={({ field, fieldState }) => (
                                  <FormItem className="flex-1">
                                    <FormControl>
                                      <Input
                                        type="email"
                                        placeholder="Почта"
                                        className={cn(
                                          "w-full px-3 md:px-4 h-[48px] md:h-[52px] border rounded-none font-sans text-sm md:text-base text-[#181818] focus:outline-none",
                                          fieldState.error
                                            ? "border-red-500"
                                            : "border-black"
                                        )}
                                        {...field}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mb-4 md:mb-6">
                          <h3 className="text-xl md:text-2xl lg:text-[32px] font-sans font-medium text-[#181818] mb-3 md:mb-4">
                            Получатель
                          </h3>
                          <div className="flex gap-3 md:gap-4 mb-3 md:mb-4 flex-wrap">
                            <FormField
                              control={form.control}
                              name="recipientType"
                              render={({ field }) => (
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    checked={field.value === "customer"}
                                    onChange={() => field.onChange("customer")}
                                    className="w-4 h-4 text-[#FF6600] focus:ring-[#FF6600]"
                                  />
                                  <span className="font-sans text-base text-[#181818]">
                                    Заказчик
                                  </span>
                                </label>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="recipientType"
                              render={({ field }) => (
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    checked={field.value === "other"}
                                    onChange={() => field.onChange("other")}
                                    className="w-4 h-4 text-[#FF6600] focus:ring-[#FF6600]"
                                  />
                                  <span className="font-sans text-base text-[#181818]">
                                    Другое лицо
                                  </span>
                                </label>
                              )}
                            />
                          </div>
                          {recipientType === "other" && (
                            <div className="space-y-4">
                              <FormField
                                control={form.control}
                                name="recipientName"
                                render={({ field, fieldState }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        placeholder="Имя получателя"
                                        className={cn(
                                          "w-full px-3 md:px-4 h-[48px] md:h-[52px] border rounded-none font-sans text-sm md:text-base text-[#181818] focus:outline-none",
                                          fieldState.error
                                            ? "border-red-500"
                                            : "border-black"
                                        )}
                                        {...field}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <div className="flex flex-col md:flex-row gap-4">
                                <FormField
                                  control={form.control}
                                  name="recipientPhone"
                                  render={({ field, fieldState }) => (
                                    <FormItem className="flex-1">
                                      <FormControl>
                                        <Input
                                          type="tel"
                                          placeholder="+7 (999) 999-99-99"
                                          className={cn(
                                            "w-full px-3 md:px-4 h-[48px] md:h-[52px] border rounded-none font-sans text-sm md:text-base text-[#181818] focus:outline-none",
                                            fieldState.error
                                              ? "border-red-500"
                                              : "border-black"
                                          )}
                                          {...field}
                                          onChange={(e) => {
                                            const formatted = formatPhoneNumber(
                                              e.target.value
                                            );
                                            field.onChange(formatted);
                                          }}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="greetingCardText"
                                  render={({ field }) => (
                                    <FormItem className="flex-1">
                                      <FormControl>
                                        <Input
                                          placeholder="Текст открытки"
                                          className="w-full px-3 md:px-4 h-[48px] md:h-[52px] border border-black rounded-none font-sans text-sm md:text-base text-[#181818] focus:outline-none"
                                          {...field}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleNextTab("delivery")}
                        className="w-full shrink-0 bg-[#FF6600] text-white font-sans text-base md:text-lg font-medium h-[52px] md:h-[60px] px-4 md:px-6 rounded-none hover:opacity-90 transition-opacity mt-auto"
                      >
                        Далее
                      </button>
                    </div>
                  )}

                  {activeTab === "delivery" && (
                    <div className="flex flex-col lg:h-full lg:min-h-0">
                      <div>
                        <div className="mb-6">
                          <h3 className="text-[32px] font-sans font-medium text-[#181818] mb-4">
                            Способ получения
                          </h3>
                          <div className="flex flex-col md:flex-row gap-4">
                            <FormField
                              control={form.control}
                              name="deliveryType"
                              render={({ field }) => (
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    checked={field.value === "delivery"}
                                    onChange={() => field.onChange("delivery")}
                                    className="w-4 h-4 text-[#FF6600] focus:ring-[#FF6600]"
                                  />
                                  <span className="font-sans text-base text-[#181818]">
                                    Доставка
                                  </span>
                                </label>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="deliveryType"
                              render={({ field }) => (
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    checked={field.value === "pickup"}
                                    onChange={() => field.onChange("pickup")}
                                    className="w-4 h-4 text-[#FF6600] focus:ring-[#FF6600]"
                                  />
                                  <span className="font-sans text-base text-[#181818]">
                                    Самовывоз
                                  </span>
                                </label>
                              )}
                            />
                          </div>
                        </div>

                        {deliveryType === "delivery" && (
                          <>
                            <div className="mb-4 md:mb-6">
                              <h3 className="text-xl md:text-2xl lg:text-[32px] font-sans font-medium text-[#181818] mb-3 md:mb-4">
                                Дата и время доставки
                              </h3>
                              <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                                <FormField
                                  control={form.control}
                                  name="deliveryDate"
                                  render={({ field }) => (
                                    <FormItem className="w-full md:flex-1">
                                      <Select
                                        value={field.value}
                                        onValueChange={(value) => {
                                          field.onChange(value);
                                        }}
                                      >
                                        <FormControl>
                                          <SelectTrigger className="w-full px-3 md:px-4 min-h-[48px] md:min-h-[52px] h-[48px] md:h-[52px] border border-black rounded-none font-sans text-sm md:text-base text-[#181818] focus:outline-none bg-white shadow-none py-0">
                                            <SelectValue placeholder="Сегодня, 10 ноября" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent
                                          side="bottom"
                                          align="start"
                                          position="popper"
                                          className="border border-black rounded-none"
                                        >
                                          {getDeliveryDateOptions().map(
                                            (option) => (
                                              <SelectItem
                                                key={option.value}
                                                value={option.value}
                                                className="rounded-none py-3"
                                              >
                                                {option.label}
                                              </SelectItem>
                                            )
                                          )}
                                        </SelectContent>
                                      </Select>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="deliveryTimeFrom"
                                  render={({ field }) => {
                                    const timeSlots = getDeliveryTimeSlots();
                                    const currentSlot = field.value
                                      ? timeSlots.find(
                                        (slot) =>
                                          slot.timeFrom === field.value
                                      )
                                      : undefined;

                                    return (
                                      <FormItem className="w-full md:flex-1">
                                        <Select
                                          value={
                                            currentSlot ? currentSlot.value : ""
                                          }
                                          onValueChange={(value) => {
                                            const { timeFrom, timeTo } =
                                              parseTimeSlot(value);
                                            field.onChange(timeFrom);
                                            form.setValue(
                                              "deliveryTimeTo",
                                              timeTo,
                                              { shouldValidate: true }
                                            );
                                          }}
                                        >
                                          <FormControl>
                                            <SelectTrigger className="w-full px-3 md:px-4 min-h-[48px] md:min-h-[52px] h-[48px] md:h-[52px] border border-black rounded-none font-sans text-sm md:text-base text-[#181818] focus:outline-none bg-white shadow-none py-0">
                                              <SelectValue placeholder="С 10:00 до 11:00" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent
                                            side="bottom"
                                            align="start"
                                            position="popper"
                                            className="border border-black rounded-none"
                                          >
                                            {timeSlots.map((slot) => (
                                              <SelectItem
                                                key={slot.value}
                                                value={slot.value}
                                                className="rounded-none py-3"
                                              >
                                                {slot.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </FormItem>
                                    );
                                  }}
                                />
                              </div>
                            </div>

                            <div className="mb-4 md:mb-6">
                              <h3 className="text-xl md:text-2xl lg:text-[32px] font-sans font-medium text-[#181818] mb-3 md:mb-4">
                                Адрес доставки
                              </h3>
                              <div className="space-y-4">
                                <FormField
                                  control={form.control}
                                  name="deliveryCity"
                                  render={({ field }) => (
                                    <FormItem>
                                      <Select
                                        value={field.value || ""}
                                        onValueChange={field.onChange}
                                      >
                                        <FormControl>
                                          <SelectTrigger className="w-full px-3 md:px-4 h-[48px] md:h-[52px] min-h-[48px] md:min-h-[52px] border border-black rounded-none font-sans text-sm md:text-base text-[#181818] focus:outline-none bg-white shadow-none">
                                            <SelectValue placeholder="Москва" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent
                                          side="bottom"
                                          align="start"
                                          position="popper"
                                          className="border border-black rounded-none"
                                        >
                                          {cities.map((city) => (
                                            <SelectItem
                                              key={city.value}
                                              value={city.value}
                                              className="rounded-none py-3"
                                            >
                                              {city.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="deliveryStreet"
                                  render={({ field, fieldState }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          placeholder="Улица"
                                          className={cn(
                                            "w-full px-3 md:px-4 h-[48px] md:h-[52px] border rounded-none font-sans text-sm md:text-base text-[#181818] focus:outline-none",
                                            fieldState.error
                                              ? "border-red-500"
                                              : "border-black"
                                          )}
                                          {...field}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <div className="flex flex-col md:flex-row gap-4">
                                  <FormField
                                    control={form.control}
                                    name="deliveryHouse"
                                    render={({ field, fieldState }) => (
                                      <FormItem className="flex-1">
                                        <FormControl>
                                          <Input
                                            placeholder="Дом"
                                            className={cn(
                                              "w-full px-3 md:px-4 h-[48px] md:h-[52px] border rounded-none font-sans text-sm md:text-base text-[#181818] focus:outline-none",
                                              fieldState.error
                                                ? "border-red-500"
                                                : "border-black"
                                            )}
                                            {...field}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="deliveryApartment"
                                    render={({ field, fieldState }) => (
                                      <FormItem className="flex-1">
                                        <FormControl>
                                          <Input
                                            placeholder="Квартира"
                                            className={cn(
                                              "w-full px-3 md:px-4 h-[48px] md:h-[52px] border rounded-none font-sans text-sm md:text-base text-[#181818] focus:outline-none",
                                              fieldState.error
                                                ? "border-red-500"
                                                : "border-black"
                                            )}
                                            {...field}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="deliveryFloor"
                                    render={({ field, fieldState }) => (
                                      <FormItem className="flex-1">
                                        <FormControl>
                                          <Input
                                            placeholder="Этаж"
                                            className={cn(
                                              "w-full px-3 md:px-4 h-[48px] md:h-[52px] border rounded-none font-sans text-sm md:text-base text-[#181818] focus:outline-none",
                                              fieldState.error
                                                ? "border-red-500"
                                                : "border-black"
                                            )}
                                            {...field}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      {deliveryType === "delivery" && (
                        <p className="text-sm text-gray-600 font-sans mb-4 mt-auto shrink-0">
                          * Для уточнения стоимости доставки с вами свяжется наш менеджер
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => handleNextTab("payment")}
                        className="w-full shrink-0 bg-[#FF6600] text-white font-sans text-base md:text-lg font-medium h-[52px] md:h-[60px] px-4 md:px-6 rounded-none hover:opacity-90 transition-opacity"
                      >
                        Далее
                      </button>
                    </div>
                  )}

                  {activeTab === "payment" && (
                    <div className="flex flex-col lg:h-full lg:min-h-0">
                      <div>
                        <h3 className="text-xl md:text-2xl lg:text-[32px] font-sans font-medium text-[#181818] mb-3 md:mb-4">
                          Пожелания
                        </h3>
                        <FormField
                          control={form.control}
                          name="comment"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Комментарий к заказу"
                                  rows={4}
                                  className="w-full px-3 md:px-4 py-2 border border-black rounded-none font-sans text-sm md:text-base text-[#181818] focus:outline-none resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-red-500 text-sm" />
                            </FormItem>
                          )}
                        />
                        {items.length === 0 && (
                          <p className="text-red-500 text-sm mt-2">
                            Корзина пуста
                          </p>
                        )}
                        {hasOnOrderItems && (
                          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded">
                            <p className="text-orange-800 text-sm font-medium">
                              В корзине есть позиции под заказ. Оплата для них
                              недоступна.
                            </p>
                            <a
                              href={storePhoneHref}
                              className="mt-2 inline-block text-[#FF6600] text-sm font-semibold hover:opacity-80"
                            >
                              Позвонить {storePhone}
                            </a>
                          </div>
                        )}
                        {apiError && (
                          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                            <p className="text-red-700 text-sm font-medium">
                              Ошибка: {apiError}
                            </p>
                          </div>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={
                          isPending || items.length === 0 || hasOnOrderItems
                        }
                        className="w-full shrink-0 bg-[#FF6600] text-white font-sans text-base md:text-lg font-medium h-[52px] md:h-[60px] px-4 md:px-6 rounded-none hover:opacity-90 transition-opacity mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isPending ? "Обработка..." : "Оплатить"}
                      </button>
                    </div>
                  )}
                </div>
                <div
                  className={`w-full shrink-0 lg:min-h-0 lg:h-full lg:min-w-[438px] lg:max-w-[438px] p-4 md:p-5 lg:p-6 border-t lg:border-t-0 border-gray-200 ${items.length > 0 ? "lg:overflow-y-auto" : "overflow-visible"
                    }`}
                >
                  <h3 className="text-xl md:text-2xl lg:text-[32px] font-sans font-medium text-[#181818] mb-4 md:mb-6">
                    Ваш заказ
                  </h3>

                  {items.length === 0 ? (
                    <p className="text-sm md:text-base font-sans text-[#181818] text-center py-6 md:py-8">
                      Корзина пуста
                    </p>
                  ) : (
                    <>
                      <div className="space-y-4 mb-6">
                        {items.map((item) => (
                          <div
                            key={item.product.id}
                            className="flex items-center gap-3 md:gap-4 bg-white p-3 md:p-4 rounded"
                          >
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded flex-shrink-0">
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
                            <div className="flex-1 min-w-0">
                              <h4 className="font-sans text-sm md:text-base text-[#181818] mb-1 truncate">
                                {item.product.name}
                              </h4>
                              <p className="font-sans text-sm md:text-base font-semibold text-[#FF6600]">
                                {item.product.price} Р
                              </p>
                              {item.product.availability_status === "on_order" && (
                                <p className="font-sans text-xs text-orange-700 mt-1">
                                  Под заказ
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.product.id)}
                              className="text-[#181818] hover:opacity-70 transition-opacity text-xl md:text-2xl lg:text-xl flex-shrink-0 leading-none"
                              aria-label="Удалить"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-gray-300 pt-4 space-y-4">
                        {!isPackagingFree && (
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hasPackaging}
                              onChange={(e) => setHasPackaging(e.target.checked)}
                              className="mt-1 w-4 h-4 text-[#FF6600] focus:ring-[#FF6600] rounded"
                            />
                            <div className="flex-1">
                              <span className="font-sans text-sm md:text-base text-[#181818]">
                                Добавить транспортировочную коробку
                              </span>
                              <span className="block font-sans text-sm text-gray-600 mt-1">
                                +{PACKAGING_PRICE} ₽
                              </span>
                            </div>
                          </label>
                        )}

                        {isPackagingFree && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded">
                            <span className="font-sans text-sm text-green-800">
                              ✓ Транспортировочная коробка включена бесплатно
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-2">
                          <span className="font-sans text-sm md:text-base text-[#181818]">
                            Итоговая сумма:
                          </span>
                          <span className="font-sans text-base md:text-lg font-semibold text-[#181818]">
                            {totalPrice} Р
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
