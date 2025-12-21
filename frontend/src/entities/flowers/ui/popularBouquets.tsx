import { POPULAR_BOUQUETS } from "@/entities/flowers/lib/constants";
import { BouquetCard } from "./popularBouquetCard";

export const PopularBouquets = () => {
  const displayedBouquets = POPULAR_BOUQUETS.slice(0, 4);
  const totalCount = POPULAR_BOUQUETS.length;

  return (
    <section className="w-full bg-[#FFFAF6] py-12 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-sans font-semibold">
            Популярные букеты
          </h2>
          <p className="text-gray-400 text-sm font-sans">
            {totalCount} товаров
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedBouquets.map((bouquet) => (
            <BouquetCard key={bouquet.id} bouquet={bouquet} />
          ))}
        </div>
      </div>
    </section>
  );
};
