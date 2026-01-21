import {
  useBouquetsSearch,
  useBouquetTypes,
  useFlowerTypes,
  usePriceRange,
} from "@/entities/flowers/hooks";
import { BouquetSearchParams } from "@/entities/flowers/types/apiTypes";
import { ProductGrid } from "@/entities/product";
import { FiltersSidebar } from "@/features/catalogFilters";
import { ERouteNames } from "@/shared/lib/routeVariables";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select/select";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export interface CatalogFilters {
  selectedBouquetTypeIds: string[];
  selectedFlowerTypeIds: string[];
  priceRange: {
    min: number | null;
    max: number | null;
  };
}

const CatalogPage = () => {
  const [urlSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("popularity");

  const getInitialFilters = (): CatalogFilters => {
    const bouquetTypeId = urlSearchParams.get("bouquet_type_id");
    return {
      selectedBouquetTypeIds: bouquetTypeId ? [bouquetTypeId] : [],
      selectedFlowerTypeIds: [],
      priceRange: {
        min: null,
        max: null,
      },
    };
  };

  const [filters, setFilters] = useState<CatalogFilters>(() =>
    getInitialFilters()
  );

  const { data: bouquetTypes } = useBouquetTypes();
  const { data: flowerTypes } = useFlowerTypes();
  const { data: priceRange } = usePriceRange();

  useEffect(() => {
    const bouquetTypeId = urlSearchParams.get("bouquet_type_id");
    setFilters((prev) => ({
      ...prev,
      selectedBouquetTypeIds: bouquetTypeId ? [bouquetTypeId] : [],
    }));
  }, [urlSearchParams]);

  const getSortValue = (
    sortBy: string
  ): "popular" | "price_asc" | "price_desc" => {
    switch (sortBy) {
      case "price-low":
        return "price_asc";
      case "price-high":
        return "price_desc";
      case "popularity":
      default:
        return "popular";
    }
  };

  const searchParams = useMemo<BouquetSearchParams>(() => {
    return {
      bouquet_type_ids:
        filters.selectedBouquetTypeIds.length > 0
          ? filters.selectedBouquetTypeIds
          : null,
      flower_type_ids:
        filters.selectedFlowerTypeIds.length > 0
          ? filters.selectedFlowerTypeIds
          : null,
      price_min: filters.priceRange.min,
      price_max: filters.priceRange.max,
      sort: getSortValue(sortBy),
    };
  }, [filters, sortBy]);

  const {
    data: bouquets,
    isLoading,
    isError,
  } = useBouquetsSearch(searchParams);

  return (
    <div className="w-full my-8 mt-6 md:my-12 md:mt-12 lg:mt-16 container mx-auto px-4 md:px-8">
      <div className="container mx-auto">
        <div className="mb-6 md:mb-10 gap-3 flex flex-col">
          <Link
            to={ERouteNames.DEFAULT_ROUTE}
            className="flex items-center gap-2 text-sm md:text-base font-sans text-[#181818] hover:opacity-80 transition-opacity mb-3 md:mb-4"
          >
            <ArrowLeft size={18} className="md:size-5" />
            <span>Главная</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[56px] font-sans text-[#181818]">
              Каталог
            </h1>
            <div className="flex items-center gap-1 md:gap-2">
              <span className="hidden sm:inline text-sm md:text-base font-sans text-[#181818]">
                Сортировать по
              </span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-0 shadow-none p-0 h-auto w-auto gap-1 focus:ring-0 focus-visible:ring-0 bg-transparent hover:bg-transparent data-[state=open]:bg-transparent text-sm md:text-base font-sans text-[#181818] [&_svg]:opacity-100 [&_svg]:text-[#181818]">
                  <SelectValue placeholder="По популярности" />
                </SelectTrigger>
                <SelectContent
                  side="bottom"
                  align="end"
                  position="popper"
                  className="border border-black rounded-none"
                >
                  <SelectItem
                    value="popularity"
                    className="rounded-none cursor-pointer"
                  >
                    популярности
                  </SelectItem>
                  <SelectItem
                    value="price-low"
                    className="rounded-none cursor-pointer"
                  >
                    наименьшей цене
                  </SelectItem>
                  <SelectItem
                    value="price-high"
                    className="rounded-none cursor-pointer"
                  >
                    наибольшей цене
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-4 md:gap-6 lg:gap-8">
          <FiltersSidebar
            filters={filters}
            onFiltersChange={setFilters}
            bouquetTypes={bouquetTypes ?? []}
            flowerTypes={flowerTypes ?? []}
            priceBounds={{
              min: priceRange?.min_price ?? 1000,
              max: priceRange?.max_price ?? 10000,
            }}
          />

          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 md:py-12">
                <div className="relative w-12 h-12 md:w-16 md:h-16">
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-[#FF6600]/20 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-[#FF6600] rounded-full animate-spin"></div>
                </div>
              </div>
            ) : isError ? (
              <div className="flex items-center justify-center py-8 md:py-12">
                <p className="text-sm md:text-base font-sans text-gray-500 px-4 text-center">
                  Не удалось загрузить продукты. Попробуйте обновить страницу.
                </p>
              </div>
            ) : bouquets && bouquets.length > 0 ? (
              <ProductGrid products={bouquets} />
            ) : (
              <div className="flex items-center justify-center py-8 md:py-12">
                <p className="text-sm md:text-base font-sans text-gray-500 px-4 text-center">
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
