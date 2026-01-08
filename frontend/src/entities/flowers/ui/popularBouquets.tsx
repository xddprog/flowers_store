import { useMemo } from "react";
import { BouquetCard } from "./popularBouquetCard";
import { usePopularBouquets } from "../hooks";
import { Bouquet } from "../types/types";

export const PopularBouquets = () => {
  const {
    data: bouquets,
    isLoading,
    isError,
  } = usePopularBouquets({
    limit: 4,
  });

  const displayedBouquets = useMemo<Bouquet[]>(() => {
    if (!bouquets) return [];

    return bouquets.map((bouquet) => ({
      id: bouquet.id,
      name: bouquet.name,
      price: bouquet.price,
      image: bouquet.main_image?.image_path,
    }));
  }, [bouquets]);

  const totalCount = bouquets?.length ?? 0;

  if (isError) {
    return (
      <section className="w-full bg-[#FFFAF6] py-12 px-4">
        <div className="container mx-auto">
          <p className="text-center text-gray-500">
            Не удалось загрузить популярные букеты
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-[#FFFAF6] py-12 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-sans font-semibold">
            Популярные букеты
          </h2>
          {!isLoading && (
            <p className="text-gray-400 text-sm font-sans">
              {totalCount} товаров
            </p>
          )}
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex flex-col animate-pulse">
                <div className="w-full bg-gray-200 aspect-[4/5] mb-4" />
                <div className="h-8 bg-gray-200 mb-2" />
                <div className="h-6 bg-gray-200 w-24" />
              </div>
            ))}
          </div>
        ) : displayedBouquets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedBouquets.map((bouquet) => (
              <BouquetCard key={bouquet.id} bouquet={bouquet} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            Популярные букеты не найдены
          </p>
        )}
      </div>
    </section>
  );
};
