import { Slider } from "@/shared/ui/slider/slider";
import { useEffect, useState } from "react";

interface PriceFilterProps {
  minPrice: number;
  maxPrice: number;
  initialMin?: number | null;
  initialMax?: number | null;
  onApply: (min: number, max: number) => void;
}

export const PriceFilter = ({
  minPrice,
  maxPrice,
  initialMin,
  initialMax,
  onApply,
}: PriceFilterProps) => {
  const [min, setMin] = useState(initialMin ?? minPrice);
  const [max, setMax] = useState(initialMax ?? maxPrice);

  useEffect(() => {
    setMin(initialMin ?? minPrice);
    setMax(initialMax ?? maxPrice);
  }, [minPrice, maxPrice, initialMin, initialMax]);

  const handleApply = () => {
    onApply(min, max);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-base font-sans text-[#181818]">
          От {min.toLocaleString("ru-RU")} ₽
        </span>
        <span className="text-base font-sans text-[#181818]">
          До {max.toLocaleString("ru-RU")} ₽
        </span>
      </div>
      <div className="mb-4">
        <Slider
          min={minPrice}
          max={maxPrice}
          value={[min, max]}
          onValueChange={(values) => {
            setMin(values[0]);
            setMax(values[1]);
          }}
          className="w-full [&_[data-slot=slider-track]]:bg-gray-200 [&_[data-slot=slider-range]]:bg-[#FF6600] [&_[data-slot=slider-thumb]]:border-[#FF6600]"
        />
      </div>
      <button
        onClick={handleApply}
        className="w-full bg-[#FF6600] text-white font-sans font-semibold py-3 px-4 hover:bg-[#E55A00] transition-colors"
      >
        Применить
      </button>
    </div>
  );
};
