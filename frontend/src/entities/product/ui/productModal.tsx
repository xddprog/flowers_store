import { useState } from "react";
import { Image } from "@/shared/ui/image/image";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog/dialog";
import { BaseBouquet, Bouquet } from "@/entities/flowers/types/types";
import { useBouquetDetail } from "@/entities/flowers/hooks";

interface ProductModalProps {
  product: BaseBouquet;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (product: Bouquet, quantity: number) => void;
}

export const ProductModal = ({
  product,
  open,
  onOpenChange,
  onAddToCart,
}: ProductModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const { data: bouquetDetail, isLoading } = useBouquetDetail(product.id);

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl w-full p-12 gap-0 border-0 rounded-none sm:rounded-lg"
        showCloseButton={false}
      >
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 bg-gray-200 flex items-center justify-center aspect-square md:aspect-auto min-h-[400px]">
            {product.main_image ? (
              <Image
                src={product.main_image.image_path}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>

          <div className="w-full md:w-1/2 px-6 flex flex-col relative bg-white">
            <div className="flex items-start justify-between mb-4">
              <DialogTitle className="text-2xl font-sans font-medium text-[#181818] pr-4">
                {product.name}
              </DialogTitle>
              <button
                onClick={() => onOpenChange(false)}
                className="text-[#181818] hover:opacity-70 transition-opacity text-xl font-sans leading-none shrink-0"
              >
                ×
              </button>
            </div>

            <div className="mb-6 flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="relative w-12 h-12">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-[#FF6600]/20 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-[#FF6600] rounded-full animate-spin"></div>
                  </div>
                </div>
              ) : (
                <p className="text-base font-sans text-[#181818] leading-relaxed">
                  {bouquetDetail?.description || "Описание отсутствует"}
                </p>
              )}
            </div>

            <p className="text-2xl font-sans font-semibold text-[#FF6600] mb-6">
              {product.price}₽
            </p>

            <div className="flex items-center gap-4">
              <div className="flex items-center bg-[#FF6600] h-[60px] w-[197px] justify-center">
                <button
                  onClick={handleDecrease}
                  className="px-4 h-full text-white cursor-pointer font-sans text-lg hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="px-4 h-full flex items-center text-white font-sans text-lg min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrease}
                  className="px-4 h-full text-white cursor-pointer font-sans text-lg hover:opacity-80 transition-opacity"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#FF6600] text-white cursor-pointer min-w-[209px] font-sans text-lg font-medium h-[60px] px-6 hover:opacity-90 transition-opacity"
              >
                В корзину
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
