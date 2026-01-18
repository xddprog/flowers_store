import { ERouteNames } from "@/shared/lib/routeVariables";
import { Image } from "@/shared/ui/image/image";
import { Link } from "react-router-dom";
import { GalleryCategory } from "../types/types";

interface GalleryCardProps {
  category: GalleryCategory;
  height?: number;
  bouquetTypeId?: string;
}

export const GalleryCard = ({ category, height, bouquetTypeId }: GalleryCardProps) => {
  const basePath = `/${ERouteNames.DASHBOARD_ROUTE}/${ERouteNames.CATALOG_ROUTE}`;
  const to = bouquetTypeId ? `${basePath}?bouquet_type_id=${bouquetTypeId}` : basePath;

  return (
    <Link
      to={to}
      className="flex flex-col cursor-pointer hover:opacity-90 transition-opacity"
    >
      <div
        className="w-full bg-gray-200 mb-4 flex items-center justify-center"
        style={{ height: height ? `${height}px` : undefined }}
      >
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>
      <h3 className="text-[32px] font-sans font-medium text-[#181818]">
        {category.name}
      </h3>
    </Link>
  );
};
