import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FiltersSidebar } from "@/widgets/catalogFilters";
import { ProductGrid } from "@/entities/product";
import { ERouteNames } from "@/shared/lib/routeVariables";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select/select";
import { useBouquetsSearch } from "@/entities/flowers/hooks";
import { BouquetSearchParams } from "@/entities/flowers/types/apiTypes";

export interface CatalogFilters {
  typeFilters: {
    flowers: boolean;
    monobouquet: boolean;
    composition: boolean;
    author: boolean;
  };
  flowerFilters: {
    roses: boolean;
    chrysanthemums: boolean;
    carnation: boolean;
    gypsophila: boolean;
  };
  priceRange: {
    min: number | null;
    max: number | null;
  };
}

const CatalogPage = () => {
  const [sortBy, setSortBy] = useState("popularity");
  const [filters, setFilters] = useState<CatalogFilters>({
    typeFilters: {
      flowers: false,
      monobouquet: false,
      composition: false,
      author: false,
    },
    flowerFilters: {
      roses: false,
      chrysanthemums: false,
      carnation: false,
      gypsophila: false,
    },
    priceRange: {
      min: null,
      max: null,
    },
  });

  const bouquetTypeMap: Record<string, string> = {
    flowers: "flowers",
    monobouquet: "monobouquet",
    composition: "composition",
    author: "author",
  };

  const flowerTypeMap: Record<string, string> = {
    roses: "roses",
    chrysanthemums: "chrysanthemums",
    carnation: "carnation",
    gypsophila: "gypsophila",
  };

  const searchParams = useMemo<BouquetSearchParams>(() => {
    const bouquetTypeIds: string[] = [];
    const flowerTypeIds: string[] = [];

    Object.entries(filters.typeFilters).forEach(([key, checked]) => {
      if (checked && bouquetTypeMap[key]) {
        bouquetTypeIds.push(bouquetTypeMap[key]);
      }
    });

    Object.entries(filters.flowerFilters).forEach(([key, checked]) => {
      if (checked && flowerTypeMap[key]) {
        flowerTypeIds.push(flowerTypeMap[key]);
      }
    });

    return {
      bouquet_type_ids: bouquetTypeIds.length > 0 ? bouquetTypeIds : null,
      flower_type_ids: flowerTypeIds.length > 0 ? flowerTypeIds : null,
      price_min: filters.priceRange.min,
      price_max: filters.priceRange.max,
    };
  }, [filters]);

  const {
    data: bouquets,
    isLoading,
    isError,
  } = useBouquetsSearch(searchParams);

  return (
    <div className="w-full my-12 mt-16">
      <div className="container mx-auto">
        <div className="mb-10 gap-3 flex flex-col">
          <Link
            to={ERouteNames.DEFAULT_ROUTE}
            className="flex items-center gap-2 text-base font-sans text-[#181818] hover:opacity-80 transition-opacity mb-4"
          >
            <ArrowLeft size={20} />
            <span>Главная</span>
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-[56px] font-sans text-[#181818]">
              Каталог
            </h1>
            <div className="flex items-center gap-1">
              <span className="text-base font-sans text-[#181818]">
                Сортировать по
              </span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-0 shadow-none p-0 h-auto w-auto gap-1 focus:ring-0 focus-visible:ring-0 bg-transparent hover:bg-transparent data-[state=open]:bg-transparent text-base font-sans text-[#181818] [&_svg]:opacity-100 [&_svg]:text-[#181818]">
                  <SelectValue placeholder="По популярности" />
                </SelectTrigger>
                <SelectContent side="bottom" align="end" position="popper">
                  <SelectItem value="popularity">популярности</SelectItem>
                  <SelectItem value="price-low">наименьшей цене</SelectItem>
                  <SelectItem value="price-high">наибольшей цене</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <FiltersSidebar filters={filters} onFiltersChange={setFilters} />

          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="relative w-16 h-16">
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-[#FF6600]/20 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-[#FF6600] rounded-full animate-spin"></div>
                </div>
              </div>
            ) : isError ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-base font-sans text-gray-500">
                  Не удалось загрузить продукты. Попробуйте обновить страницу.
                </p>
              </div>
            ) : bouquets && bouquets.length > 0 ? (
              <ProductGrid products={bouquets} />
            ) : (
              <div className="flex items-center justify-center py-12">
                <p className="text-base font-sans text-gray-500">
                  Продукты не найдены
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;
