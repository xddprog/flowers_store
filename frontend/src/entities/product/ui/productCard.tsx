import { useState } from "react";
import { Image } from "@/shared/ui/image/image";
import { Bouquet } from "@/entities/flowers/types/types";
import { ProductModal } from "./productModal";
import { basketService } from "../lib/basketService";

interface ProductCardProps {
  product: Bouquet;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCart = (product: Bouquet, quantity: number) => {
    basketService.addItem(product, quantity);
  };

  return (
    <>
      <div
        className="flex flex-col cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="w-full bg-gray-200 mb-4 flex items-center justify-center aspect-square">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>
        <h3 className="text-base font-sans text-[#181818] mb-2">
          {product.name}
        </h3>
        <p className="text-base font-sans text-[#181818] font-semibold">
          {product.price} Р
        </p>
      </div>

      <ProductModal
        product={product}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onAddToCart={handleAddToCart}
      />
    </>
  );
};
