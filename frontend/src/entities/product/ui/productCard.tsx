import { Image } from "@/shared/ui/image/image";
import { Bouquet } from "@/entities/flowers/types/types";

interface ProductCardProps {
  product: Bouquet;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div className="flex flex-col cursor-pointer hover:opacity-90 transition-opacity">
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
      <h3 className="text-base font-sans text-[#181818] mb-2">{product.name}</h3>
      <p className="text-base font-sans text-[#181818] font-semibold">
        {product.price} Р
      </p>
    </div>
  );
};

