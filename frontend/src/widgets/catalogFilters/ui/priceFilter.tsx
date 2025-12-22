import { useState } from "react";

interface PriceFilterProps {
  minPrice: number;
  maxPrice: number;
  onApply: (min: number, max: number) => void;
}

export const PriceFilter = ({
  minPrice,
  maxPrice,
  onApply,
}: PriceFilterProps) => {
  const [min, setMin] = useState(minPrice);
  const [max, setMax] = useState(maxPrice);

  const handleApply = () => {
    onApply(min, max);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-base font-sans text-[#181818]">От</span>
          <input
            type="number"
            value={min}
            onChange={(e) => setMin(Number(e.target.value))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-base font-sans text-[#181818] focus:outline-none focus:ring-2 focus:ring-[#FF6600]"
            placeholder="1000"
          />
          <span className="text-base font-sans text-[#181818]">Р</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-sans text-[#181818]">До</span>
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-base font-sans text-[#181818] focus:outline-none focus:ring-2 focus:ring-[#FF6600]"
            placeholder="10000"
          />
          <span className="text-base font-sans text-[#181818]">Р</span>
        </div>
      </div>
      <div className="mb-4">
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={min}
          onChange={(e) => setMin(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FF6600]"
        />
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={max}
          onChange={(e) => setMax(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FF6600] mt-2"
        />
      </div>
      <button
        onClick={handleApply}
        className="w-full bg-[#FF6600] text-white font-sans font-semibold py-3 px-4 rounded hover:bg-[#E55A00] transition-colors"
      >
        Применить
      </button>
    </div>
  );
};

