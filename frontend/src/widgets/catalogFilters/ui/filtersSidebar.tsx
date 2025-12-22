import { useState } from "react";
import { FilterSection } from "./filterSection";
import { CheckboxFilter } from "./checkboxFilter";
import { PriceFilter } from "./priceFilter";
import { ActiveFilters } from "./activeFilters";

interface ActiveFilter {
  id: string;
  label: string;
}

export const FiltersSidebar = () => {
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([
    { id: "1", label: "Цветы" },
    { id: "2", label: "Розы" },
    { id: "3", label: "от 1000 Р" },
    { id: "4", label: "до 10 000 Р" },
  ]);

  const [typeFilters, setTypeFilters] = useState({
    flowers: true,
    monobouquet: false,
    composition: false,
    author: false,
  });

  const [flowerFilters, setFlowerFilters] = useState({
    roses: true,
    chrysanthemums: false,
    carnation: false,
    gypsophila: false,
  });

  const handleRemoveFilter = (id: string) => {
    setActiveFilters(activeFilters.filter((f) => f.id !== id));
  };

  const handleReset = () => {
    setActiveFilters([]);
    setTypeFilters({
      flowers: false,
      monobouquet: false,
      composition: false,
      author: false,
    });
    setFlowerFilters({
      roses: false,
      chrysanthemums: false,
      carnation: false,
      gypsophila: false,
    });
  };

  const handlePriceApply = (_min: number, _max: number) => {
    // Логика применения цены (только верстка)
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
            className="text-sm font-sans text-[#FF6600] hover:opacity-80 transition-opacity"
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
            checked={typeFilters.flowers}
            onChange={(checked) =>
              setTypeFilters({ ...typeFilters, flowers: checked })
            }
          />
          <CheckboxFilter
            id="monobouquet"
            label="Монобукет"
            checked={typeFilters.monobouquet}
            onChange={(checked) =>
              setTypeFilters({ ...typeFilters, monobouquet: checked })
            }
          />
          <CheckboxFilter
            id="composition"
            label="Композиция"
            checked={typeFilters.composition}
            onChange={(checked) =>
              setTypeFilters({ ...typeFilters, composition: checked })
            }
          />
          <CheckboxFilter
            id="author"
            label="Авторский букет"
            checked={typeFilters.author}
            onChange={(checked) =>
              setTypeFilters({ ...typeFilters, author: checked })
            }
          />
        </FilterSection>

        <FilterSection title="Цветы" showMore>
          <CheckboxFilter
            id="roses"
            label="Розы"
            checked={flowerFilters.roses}
            onChange={(checked) =>
              setFlowerFilters({ ...flowerFilters, roses: checked })
            }
          />
          <CheckboxFilter
            id="chrysanthemums"
            label="Хризантемы"
            checked={flowerFilters.chrysanthemums}
            onChange={(checked) =>
              setFlowerFilters({ ...flowerFilters, chrysanthemums: checked })
            }
          />
          <CheckboxFilter
            id="carnation"
            label="Гвоздика"
            checked={flowerFilters.carnation}
            onChange={(checked) =>
              setFlowerFilters({ ...flowerFilters, carnation: checked })
            }
          />
          <CheckboxFilter
            id="gypsophila"
            label="Гипсофилы"
            checked={flowerFilters.gypsophila}
            onChange={(checked) =>
              setFlowerFilters({ ...flowerFilters, gypsophila: checked })
            }
          />
        </FilterSection>

        <FilterSection title="Цена" border={false}>
          <PriceFilter
            minPrice={1000}
            maxPrice={10000}
            onApply={handlePriceApply}
          />
        </FilterSection>
      </div>
    </aside>
  );
};
