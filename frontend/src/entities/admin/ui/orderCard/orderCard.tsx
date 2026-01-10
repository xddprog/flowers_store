import { AdminOrder } from "../../types/apiTypes";
import { cn } from "@/shared/lib/mergeClass";

interface OrderCardProps {
  order: AdminOrder;
}

const statusLabels: Record<string, string> = {
  paid: "Оплачен",
  processing: "Обрабатывается",
  completed: "Выполнен",
  cancelled: "Отменен",
};

const statusColors: Record<string, string> = {
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-[#FF6600]/10 text-[#FF6600]",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export const OrderCard = ({ order }: OrderCardProps) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const monthNames = [
        "янв",
        "фев",
        "мар",
        "апр",
        "май",
        "июн",
        "июл",
        "авг",
        "сен",
        "окт",
        "ноя",
        "дек",
      ];
      const day = date.getDate().toString().padStart(2, "0");
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return dateString;
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("ru-RU");
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 hover:shadow-md transition-shadow">
      <div className="mb-1">
        <h3 className="font-semibold text-gray-800 text-sm mb-1">
          Заказ #{order.id.slice(0, 8)}
        </h3>
        <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
      </div>

      <div className="space-y-2 mb-2">
        {order.recipient_name && (
          <p className="text-xs text-gray-700 line-clamp-1">
            {order.recipient_name}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            statusColors[order.status] || statusColors.cancelled
          )}
        >
          {statusLabels[order.status] || order.status}
        </span>
        <span className="text-sm font-semibold text-gray-800">
          {formatAmount(order.total_amount)} ₽
        </span>
      </div>
    </div>
  );
};
