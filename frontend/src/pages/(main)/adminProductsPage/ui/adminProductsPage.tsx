import { useState } from "react";
import { useGetAdminBouquets } from "@/entities/admin/hooks";
import { AdminProductGrid } from "@/widgets/adminProductGrid";
import { CreateBouquetModal } from "@/entities/admin/ui/createBouquetModal";
import { useQueryClient } from "@tanstack/react-query";
import { GET_ADMIN_BOUQUETS_QUERY } from "@/entities/admin/lib/queryKeys";

const AdminProductsPage = () => {
  const limit = 20;
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    data: products,
    isLoading,
    error,
  } = useGetAdminBouquets({
    limit,
    offset: 0,
  });

  const handleCreateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: [GET_ADMIN_BOUQUETS_QUERY] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-gray-800">Продукты</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-[250px] bg-[#FF6600] text-white cursor-pointer font-sans font-semibold py-3 px-4 hover:bg-[#E55A00] transition-colors"
        >
          Добавить продукт
        </button>
      </div>

      {isLoading && (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Загрузка продуктов...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">
            Ошибка при загрузке продуктов. Попробуйте обновить страницу.
          </p>
        </div>
      )}

      {products && products.length > 0 && (
        <AdminProductGrid products={products} />
      )}

      {products && products.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Продукты не найдены</p>
        </div>
      )}

      <CreateBouquetModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default AdminProductsPage;
