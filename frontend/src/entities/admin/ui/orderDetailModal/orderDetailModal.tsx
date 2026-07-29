import { AdminOrder } from "../../types/apiTypes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog/dialog";
import { cn } from "@/shared/lib/mergeClass";

interface OrderDetailModalProps {
  order: AdminOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (orderId: string, newStatus: string) => void;
}

const statusLabels: Record<string, string> = {
  pending: "Ожидает оплаты",
  paid: "Оплачен",
  failed: "Ошибка оплаты",
  processing: "Обрабатывается",
  completed: "Выполнен",
  cancelled: "Отменен",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-800",
  processing: "bg-[#FF6600]/10 text-[#FF6600]",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const deliveryMethodLabels: Record<string, string> = {
  delivery: "Доставка",
  pickup: "Самовывоз",
};

export const OrderDetailModal = ({
  order,
  open,
  onOpenChange,
}: OrderDetailModalProps) => {
  if (!order) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("ru-RU");
  };

  const formatDateOnly = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const formatTimeOnly = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-800">
            Детали заказа #{order.id.slice(0, 8)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  Информация о заказе
                </h3>
                <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Дата создания:
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Статус:</span>
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        statusColors[order.status] || statusColors.cancelled
                      )}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Сумма заказа:</span>
                    <span className="text-lg font-semibold text-[#FF6600]">
                      {formatAmount(order.total_amount)} ₽
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Активен:</span>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        order.is_active ? "text-green-600" : "text-gray-400"
                      )}
                    >
                      {order.is_active ? "Да" : "Нет"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Способ получения:
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {deliveryMethodLabels[order.delivery_method] ||
                        order.delivery_method}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  Состав заказа
                </h3>
                <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                  {order.items?.length ? (
                    order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-4 border-b border-gray-200 last:border-b-0 pb-3 last:pb-0"
                      >
                        <div>
                          <span className="text-sm font-medium text-gray-800 block">
                            {item.bouquet_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {item.quantity} шт. × {formatAmount(item.price)} ₽
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                          {formatAmount(item.price * item.quantity)} ₽
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">
                      Позиции заказа не указаны
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  Контактная информация клиента
                </h3>
                <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">
                      Email
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {order.customer_email || "Не указан"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">
                      Телефон
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {order.customer_phone || "Не указан"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  Получатель
                </h3>
                <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">
                      Имя получателя
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {order.recipient_name || "Не указано"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">
                      Телефон получателя
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {order.recipient_phone || "Не указан"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  Доставка
                </h3>
                <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">
                        Дата доставки
                      </span>
                      <span className="text-sm font-medium text-gray-800">
                        {formatDateOnly(order.delivery_date)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">
                        Время доставки
                      </span>
                      <span className="text-sm font-medium text-gray-800">
                        {formatTimeOnly(order.delivery_time_from)} —{" "}
                        {formatTimeOnly(order.delivery_time_to)}
                      </span>
                    </div>
                  </div>
                  {order.delivery_city ||
                  order.delivery_street ||
                  order.delivery_house ? (
                    <div className="space-y-2">
                      {order.delivery_city && (
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">
                            Город
                          </span>
                          <span className="text-sm font-medium text-gray-800">
                            {order.delivery_city}
                          </span>
                        </div>
                      )}
                      {order.delivery_street && (
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">
                            Улица
                          </span>
                          <span className="text-sm font-medium text-gray-800">
                            {order.delivery_street}
                          </span>
                        </div>
                      )}
                      {(order.delivery_house ||
                        order.delivery_apartment ||
                        order.delivery_floor) && (
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">
                            Дом, квартира, этаж
                          </span>
                          <span className="text-sm font-medium text-gray-800">
                            {order.delivery_house &&
                              `д. ${order.delivery_house}`}
                            {order.delivery_apartment &&
                              `, кв. ${order.delivery_apartment}`}
                            {order.delivery_floor &&
                              `, этаж ${order.delivery_floor}`}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">
                      Адрес доставки не указан
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Комментарии клиента
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <span className="text-xs text-gray-500 block mb-1">
                  Комментарий к заказу
                </span>
                <p className="text-sm font-medium text-gray-800 whitespace-pre-wrap">
                  {order.comment || "Не указан"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <span className="text-xs text-gray-500 block mb-1">
                  Текст открытки
                </span>
                <p className="text-sm font-medium text-gray-800 whitespace-pre-wrap">
                  {order.greeting_card_text || "Не указан"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
