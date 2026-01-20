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
        <div
          className="w-full bg-gray-200 mb-4 flex items-center justify-center"
          style={{ aspectRatio: "0.780051" }}
        >
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
        <h3 className="text-xl md:text-2xl mb-2 2xl:text-[32px] font-sans text-black font-medium leading-tight lg:leading-7">
          {bouquet.name}
        </h3>
        <p className="font-sans text-[#FF6600] text-lg md:text-xl lg:text-[20px] xl:text-[24px] font-medium">
          {bouquet.price.toLocaleString("ru-RU")} ₽
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
