import { AdminCustomer } from "../../types/apiTypes";
import { cn } from "@/shared/lib/mergeClass";
import { Button } from "@/shared/ui/button/button";

interface CustomerCardProps {
  customer: AdminCustomer;
  onToggleBlock: (email: string, isBlocked: boolean) => void;
  isBlocking?: boolean;
}

export const CustomerCard = ({
  customer,
  onToggleBlock,
  isBlocking = false,
}: CustomerCardProps) => {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border px-4 py-4",
        customer.is_blocked && "border-red-200 bg-red-50/30"
      )}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between relative">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 text-base mb-1">
              {customer.name || "Не указано"}
            </h3>
            {customer.email && (
              <p className="text-sm text-gray-600">{customer.email}</p>
            )}
            {customer.phone && (
              <p className="text-sm text-gray-500 mt-1">{customer.phone}</p>
            )}
          </div>
          <div
            className={cn(
              "px-3 py-1 rounded-full absolute text-xs font-medium right-0",
              customer.is_blocked
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            )}
          >
            {customer.is_blocked ? "Заблокирован" : "Активен"}
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <Button
            onClick={() => onToggleBlock(customer.email, customer.is_blocked)}
            disabled={isBlocking}
            className={cn(
              "w-full font-sans font-medium transition-colors cursor-pointer",
              customer.is_blocked
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            )}
          >
            {isBlocking
              ? "Обработка..."
              : customer.is_blocked
              ? "Разблокировать"
              : "Заблокировать"}
          </Button>
        </div>
      </div>
    </div>
  );
};
