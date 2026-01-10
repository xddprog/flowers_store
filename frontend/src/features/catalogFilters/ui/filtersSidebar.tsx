import { useMemo, useState } from "react";
import { FilterSection } from "./filterSection";
import { CheckboxFilter } from "./checkboxFilter";
import { PriceFilter } from "./priceFilter";
import { ActiveFilters } from "./activeFilters";
import { CatalogFilters } from "@/pages/(main)/catalogPage/ui/catalogPage";
import { BouquetType, FlowerType } from "@/entities/flowers/types/apiTypes";

interface ActiveFilter {
  id: string;
  label: string;
}

interface FiltersSidebarProps {
  filters: CatalogFilters;
  onFiltersChange: (filters: CatalogFilters) => void;
  bouquetTypes: BouquetType[];
  flowerTypes: FlowerType[];
}

export const FiltersSidebar = ({
  filters,
  onFiltersChange,
  bouquetTypes,
  flowerTypes,
}: FiltersSidebarProps) => {
  const [isBouquetTypesExpanded, setIsBouquetTypesExpanded] = useState(false);
  const [isFlowerTypesExpanded, setIsFlowerTypesExpanded] = useState(false);

  const displayedBouquetTypes = useMemo(() => {
    return isBouquetTypesExpanded ? bouquetTypes : bouquetTypes.slice(0, 4);
  }, [bouquetTypes, isBouquetTypesExpanded]);

  const displayedFlowerTypes = useMemo(() => {
    return isFlowerTypesExpanded ? flowerTypes : flowerTypes.slice(0, 4);
  }, [flowerTypes, isFlowerTypesExpanded]);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filtersList: ActiveFilter[] = [];

    filters.selectedBouquetTypeIds.forEach((typeId) => {
      const type = bouquetTypes.find((t) => t.id === typeId);
      if (type) {
        filtersList.push({ id: `type-${typeId}`, label: type.name });
      }
    });

    filters.selectedFlowerTypeIds.forEach((typeId) => {
      const type = flowerTypes.find((t) => t.id === typeId);
      if (type) {
        filtersList.push({ id: `flower-${typeId}`, label: type.name });
      }
    });

    if (filters.priceRange.min !== null) {
      filtersList.push({
        id: "price-min",
        label: `от ${filters.priceRange.min.toLocaleString("ru-RU")} ₽`,
      });
    }
    if (filters.priceRange.max !== null) {
      filtersList.push({
        id: "price-max",
        label: `до ${filters.priceRange.max.toLocaleString("ru-RU")} ₽`,
      });
    }

    return filtersList;
  }, [filters, bouquetTypes, flowerTypes]);

  const handleRemoveFilter = (id: string) => {
    const newFilters = { ...filters };

    if (id.startsWith("type-")) {
      const typeId = id.replace("type-", "");
      newFilters.selectedBouquetTypeIds =
        newFilters.selectedBouquetTypeIds.filter((tid) => tid !== typeId);
    } else if (id.startsWith("flower-")) {
      const flowerId = id.replace("flower-", "");
      newFilters.selectedFlowerTypeIds =
        newFilters.selectedFlowerTypeIds.filter((fid) => fid !== flowerId);
    } else if (id === "price-min") {
      newFilters.priceRange = {
        ...newFilters.priceRange,
        min: null,
      };
    } else if (id === "price-max") {
      newFilters.priceRange = {
        ...newFilters.priceRange,
        max: null,
      };
    }

    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    onFiltersChange({
      selectedBouquetTypeIds: [],
      selectedFlowerTypeIds: [],
      priceRange: {
        min: null,
        max: null,
      },
    });
  };

  const handlePriceApply = (min: number, max: number) => {
    onFiltersChange({
      ...filters,
      priceRange: {
        min,
        max,
      },
    });
  };

  return (
    <aside className="w-full md:w-[295px] flex-shrink-0">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[32px] font-sans font-medium text-[#3F3F3F] leading-[40px]">
            Фильтры
          </h2>
          <button
            onClick={handleReset}
            className="text-[20px] font-sans text-[#838383] cursor-pointer hover:opacity-80 transition-opacity pt-1"
          >
            Сбросить
          </button>
        </div>

        <ActiveFilters filters={activeFilters} onRemove={handleRemoveFilter} />
        <div className="mb-6 border-b border-gray-300" />

        <FilterSection
          title="Тип"
          showMore={bouquetTypes.length > 4}
          onShowMore={() => setIsBouquetTypesExpanded(!isBouquetTypesExpanded)}
          isExpanded={isBouquetTypesExpanded}
        >
          {displayedBouquetTypes.map((type) => (
            <CheckboxFilter
              key={type.id}
              id={type.id}
              label={type.name}
              checked={filters.selectedBouquetTypeIds.includes(type.id)}
              onChange={(checked) => {
                if (checked) {
                  onFiltersChange({
                    ...filters,
                    selectedBouquetTypeIds: [
                      ...filters.selectedBouquetTypeIds,
                      type.id,
                    ],
                  });
                } else {
                  onFiltersChange({
                    ...filters,
                    selectedBouquetTypeIds:
                      filters.selectedBouquetTypeIds.filter(
                        (id) => id !== type.id
                      ),
                  });
                }
              }}
            />
          ))}
        </FilterSection>

        <FilterSection
          title="Цветы"
          showMore={flowerTypes.length > 4}
          onShowMore={() => setIsFlowerTypesExpanded(!isFlowerTypesExpanded)}
          isExpanded={isFlowerTypesExpanded}
        >
          {displayedFlowerTypes.map((type) => (
            <CheckboxFilter
              key={type.id}
              id={type.id}
              label={type.name}
              checked={filters.selectedFlowerTypeIds.includes(type.id)}
              onChange={(checked) => {
                if (checked) {
                  onFiltersChange({
                    ...filters,
                    selectedFlowerTypeIds: [
                      ...filters.selectedFlowerTypeIds,
                      type.id,
                    ],
                  });
                } else {
                  onFiltersChange({
                    ...filters,
                    selectedFlowerTypeIds: filters.selectedFlowerTypeIds.filter(
                      (id) => id !== type.id
                    ),
                  });
                }
              }}
            />
          ))}
        </FilterSection>

        <FilterSection title="Цена" border={false}>
          <PriceFilter
            minPrice={filters.priceRange.min ?? 1000}
            maxPrice={filters.priceRange.max ?? 10000}
            onApply={handlePriceApply}
          />
        </FilterSection>
      </div>
    </aside>
  );
};
