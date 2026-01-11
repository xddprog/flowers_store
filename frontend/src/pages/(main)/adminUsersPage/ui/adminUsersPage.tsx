import { useState } from "react";
import {
  useGetAdminCustomers,
  useBlockCustomer,
  useUnblockCustomer,
} from "@/entities/admin/hooks";
import { CustomerCard } from "@/entities/admin/ui/customerCard";

const AdminUsersPage = () => {
  const limit = 100;
  const [blockingEmail, setBlockingEmail] = useState<string | null>(null);

  const {
    data: customers = [],
    isLoading,
    error,
  } = useGetAdminCustomers({
    limit,
    offset: 0,
  });

  const blockCustomer = useBlockCustomer();
  const unblockCustomer = useUnblockCustomer();

  const handleToggleBlock = async (email: string, isBlocked: boolean) => {
    setBlockingEmail(email);
    try {
      if (isBlocked) {
        await unblockCustomer.mutateAsync(email);
      } else {
        await blockCustomer.mutateAsync(email);
      }
    } catch (error) {
      console.error("Ошибка при изменении статуса пользователя:", error);
    } finally {
      setBlockingEmail(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold text-gray-800">Пользователи</h1>
        <div className="flex items-center justify-center py-12">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-[#FF6600]/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-[#FF6600] rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold text-gray-800">Пользователи</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">
            Ошибка при загрузке пользователей. Попробуйте обновить страницу.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-gray-800">Пользователи</h1>

      {customers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-center py-8">
            Пользователи не найдены
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {customers.map((customer) => (
            <CustomerCard
              key={customer.email}
              customer={customer}
              onToggleBlock={handleToggleBlock}
              isBlocking={blockingEmail === customer.email}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
