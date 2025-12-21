import { Image } from "@/shared/ui/image/image";
import { Bouquet } from "../types/types";

interface BouquetCardProps {
  bouquet: Bouquet;
}

export const BouquetCard = ({ bouquet }: BouquetCardProps) => {
  return (
    <div className="flex flex-col">
      <div className="w-full bg-gray-200 aspect-[4/5] mb-4 flex items-center justify-center">
        {bouquet.image ? (
          <Image
            src={bouquet.image}
            alt={bouquet.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>
      <h3 className="text-base font-sans font-medium text-[32px] text-[#181818]">
        {bouquet.name}
      </h3>
      <p className="text-[#FF6600] font-sans text-[24px] font-semibold">
        {bouquet.price.toLocaleString("ru-RU")}₽
      </p>
    </div>
  );
};
