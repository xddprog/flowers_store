import { useMemo } from "react";
import { FilterSection } from "./filterSection";
import { CheckboxFilter } from "./checkboxFilter";
import { PriceFilter } from "./priceFilter";
import { ActiveFilters } from "./activeFilters";
import { CatalogFilters } from "@/pages/(main)/catalogPage/ui/catalogPage";

interface ActiveFilter {
  id: string;
  label: string;
}

interface FiltersSidebarProps {
  filters: CatalogFilters;
  onFiltersChange: (filters: CatalogFilters) => void;
}

export const FiltersSidebar = ({
  filters,
  onFiltersChange,
}: FiltersSidebarProps) => {
  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filtersList: ActiveFilter[] = [];

    if (filters.typeFilters.flowers) {
      filtersList.push({ id: "type-flowers", label: "Цветы" });
    }
    if (filters.typeFilters.monobouquet) {
      filtersList.push({ id: "type-monobouquet", label: "Монобукет" });
    }
    if (filters.typeFilters.composition) {
      filtersList.push({ id: "type-composition", label: "Композиция" });
    }
    if (filters.typeFilters.author) {
      filtersList.push({ id: "type-author", label: "Авторский букет" });
    }

    if (filters.flowerFilters.roses) {
      filtersList.push({ id: "flower-roses", label: "Розы" });
    }
    if (filters.flowerFilters.chrysanthemums) {
      filtersList.push({ id: "flower-chrysanthemums", label: "Хризантемы" });
    }
    if (filters.flowerFilters.carnation) {
      filtersList.push({ id: "flower-carnation", label: "Гвоздика" });
    }
    if (filters.flowerFilters.gypsophila) {
      filtersList.push({ id: "flower-gypsophila", label: "Гипсофилы" });
    }

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
  }, [filters]);

  const handleRemoveFilter = (id: string) => {
    const newFilters = { ...filters };

    if (id.startsWith("type-")) {
      const typeKey = id.replace(
        "type-",
        ""
      ) as keyof typeof filters.typeFilters;
      newFilters.typeFilters = {
        ...newFilters.typeFilters,
        [typeKey]: false,
      };
    } else if (id.startsWith("flower-")) {
      const flowerKey = id.replace(
        "flower-",
        ""
      ) as keyof typeof filters.flowerFilters;
      newFilters.flowerFilters = {
        ...newFilters.flowerFilters,
        [flowerKey]: false,
      };
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
    <aside className="w-full md:w-80 flex-shrink-0">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[32px] font-sans font-medium text-[#3F3F3F] leading-[40px]">
            Фильтры
          </h2>
          <button
            onClick={handleReset}
            className="text-[20px] font-sans text-[#838383] cursor-pointer hover:opacity-80 transition-opacity"
          >
            Сбросить
          </button>
        </div>

        <ActiveFilters filters={activeFilters} onRemove={handleRemoveFilter} />
        <div className="mb-6 border-b border-gray-300" />

        <FilterSection title="Тип" showMore>
          <CheckboxFilter
            id="flowers"
            label="Цветы"
            checked={filters.typeFilters.flowers}
            onChange={(checked) =>
              onFiltersChange({
                ...filters,
                typeFilters: {
                  ...filters.typeFilters,
                  flowers: checked,
                },
              })
            }
          />
          <CheckboxFilter
            id="monobouquet"
            label="Монобукет"
            checked={filters.typeFilters.monobouquet}
            onChange={(checked) =>
              onFiltersChange({
                ...filters,
                typeFilters: {
                  ...filters.typeFilters,
                  monobouquet: checked,
                },
              })
            }
          />
          <CheckboxFilter
            id="composition"
            label="Композиция"
            checked={filters.typeFilters.composition}
            onChange={(checked) =>
              onFiltersChange({
                ...filters,
                typeFilters: {
                  ...filters.typeFilters,
                  composition: checked,
                },
              })
            }
          />
          <CheckboxFilter
            id="author"
            label="Авторский букет"
            checked={filters.typeFilters.author}
            onChange={(checked) =>
              onFiltersChange({
                ...filters,
                typeFilters: {
                  ...filters.typeFilters,
                  author: checked,
                },
              })
            }
          />
        </FilterSection>

        <FilterSection title="Цветы" showMore>
          <CheckboxFilter
            id="roses"
            label="Розы"
            checked={filters.flowerFilters.roses}
            onChange={(checked) =>
              onFiltersChange({
                ...filters,
                flowerFilters: {
                  ...filters.flowerFilters,
                  roses: checked,
                },
              })
            }
          />
          <CheckboxFilter
            id="chrysanthemums"
            label="Хризантемы"
            checked={filters.flowerFilters.chrysanthemums}
            onChange={(checked) =>
              onFiltersChange({
                ...filters,
                flowerFilters: {
                  ...filters.flowerFilters,
                  chrysanthemums: checked,
                },
              })
            }
          />
          <CheckboxFilter
            id="carnation"
            label="Гвоздика"
            checked={filters.flowerFilters.carnation}
            onChange={(checked) =>
              onFiltersChange({
                ...filters,
                flowerFilters: {
                  ...filters.flowerFilters,
                  carnation: checked,
                },
              })
            }
          />
          <CheckboxFilter
            id="gypsophila"
            label="Гипсофилы"
            checked={filters.flowerFilters.gypsophila}
            onChange={(checked) =>
              onFiltersChange({
                ...filters,
                flowerFilters: {
                  ...filters.flowerFilters,
                  gypsophila: checked,
                },
              })
            }
          />
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
