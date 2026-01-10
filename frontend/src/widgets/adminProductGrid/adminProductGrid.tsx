import { BaseBouquet } from "@/entities/flowers/types/apiTypes";
import { AdminProductCard } from "@/entities/admin/ui/adminProductCard";

interface AdminProductGridProps {
  products: BaseBouquet[];
}

export const AdminProductGrid = ({ products }: AdminProductGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <AdminProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

