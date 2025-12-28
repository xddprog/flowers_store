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
        <h3 className="text-[32px] font-sans text-black font-medium leading-10">
          {product.name}
        </h3>
        <p className="font-sans text-[#FF6600] text-[24px] font-medium">
          {product.price} ₽
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
