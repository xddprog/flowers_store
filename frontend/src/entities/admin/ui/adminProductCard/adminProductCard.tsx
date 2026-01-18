import { BaseBouquet } from "@/entities/flowers/types/apiTypes";
import { ERouteNames } from "@/shared/lib/routeVariables";
import { Image } from "@/shared/ui/image/image";
import { Link } from "react-router-dom";

interface AdminProductCardProps {
  product: BaseBouquet;
}

export const AdminProductCard = ({ product }: AdminProductCardProps) => {
  return (
    <Link
      to={`/${ERouteNames.ADMIN_DASHBOARD_ROUTE}/${ERouteNames.ADMIN_PRODUCTS_ROUTE}/${product.id}`}
      className="flex flex-col cursor-pointer hover:opacity-90 transition-opacity"
    >
      <div className="w-full bg-gray-200 mb-4 flex items-center justify-center aspect-square overflow-hidden">
        {product.main_image ? (
          <Image
            src={product.main_image.image_path}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Нет изображения</span>
          </div>
        )}
      </div>
      <h3 className="text-xl font-sans text-black font-medium leading-tight mb-2">
        {product.name}
      </h3>
      <p className="font-sans text-[#FF6600] text-lg font-medium">
        {product.price.toLocaleString("ru-RU")} ₽
      </p>
    </Link>
  );
};
