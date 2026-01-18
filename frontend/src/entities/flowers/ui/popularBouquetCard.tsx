import { basketService } from "@/entities/product/lib/basketService";
import { ProductModal } from "@/entities/product/ui/productModal";
import { Image } from "@/shared/ui/image/image";
import { useState } from "react";
import { BaseBouquet, Bouquet } from "../types/types";

interface BouquetCardProps {
  bouquet: Bouquet;
}

export const BouquetCard = ({ bouquet }: BouquetCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCart = (product: Bouquet, quantity: number) => {
    basketService.addItem(product, quantity);
  };

  const baseBouquet: BaseBouquet = {
    id: bouquet.id,
    name: bouquet.name,
    price: bouquet.price,
    main_image: bouquet.image ? { id: "", image_path: bouquet.image, order: 0 } : null,
  };

  return (
    <>
      <div
        className="flex flex-col cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => setIsModalOpen(true)}
      >
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
      {isModalOpen && (
        <ProductModal
          product={baseBouquet}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onAddToCart={(_, quantity) => handleAddToCart(bouquet, quantity)}
        />
      )}
    </>
  );
};
