import { useState } from "react";
import { Image } from "@/shared/ui/image/image";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog/dialog";
import { BaseBouquet, Bouquet } from "@/entities/flowers/types/types";
import { useBouquetDetail } from "@/entities/flowers/hooks";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/shared/ui/carousel/carousel";

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
        className="max-w-5xl w-full rounded-none h-full lg:h-auto lg:max-h-[90vh] p-0 lg:p-12 gap-0 border-0 overflow-hidden"
        showCloseButton={false}
      >
        {/* Кнопка закрытия вверху для мобильных */}
        <button
          onClick={() => onOpenChange(false)}
          className="lg:hidden fixed top-4 right-4 z-50 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg text-[#181818] hover:opacity-70 transition-opacity text-2xl font-sans leading-none"
          aria-label="Закрыть"
        >
          ×
        </button>

        <div className="flex flex-col lg:flex-row h-full lg:h-auto p-5 lg:p-0">
          <div className="w-full lg:w-1/2 bg-gray-200 aspect-square lg:aspect-auto max-h-[500px] min-h-[300px] md:min-h-[400px] lg:min-h-[400px] relative overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center w-full h-full absolute inset-0">
                <div className="relative w-10 h-10 md:w-12 md:h-12">
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-[#FF6600]/20 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-[#FF6600] rounded-full animate-spin"></div>
                </div>
              </div>
            ) : bouquetDetail &&
              bouquetDetail.images &&
              bouquetDetail.images.length > 0 ? (
              <Carousel
                className="w-full h-full"
                opts={{
                  align: "start",
                  loop: bouquetDetail.images.length > 1,
                }}
              >
                <CarouselContent className="-ml-0">
                  {[...bouquetDetail.images]
                    .sort((a, b) => a.order - b.order)
                    .map((image, index) => (
                      <CarouselItem key={image.id} className="pl-0 basis-full">
                        <div className="relative aspect-square lg:aspect-auto min-h-[300px] md:min-h-[400px] lg:min-h-[400px] overflow-hidden bg-gray-200">
                          <Image
                            src={image.image_path}
                            alt={`${product.name} - изображение ${index + 1}`}
                            className="w-full h-full object-cover"
                            loading={index === 0 ? "eager" : "lazy"}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                </CarouselContent>
              </Carousel>
            ) : product.main_image ? (
              <Image
                src={product.main_image.image_path}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>

          <div className="w-full lg:w-1/2 lg:pl-6 pt-4 pb-6 lg:pt-0 lg:pb-0 flex flex-col relative bg-white overflow-y-auto">
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <DialogTitle className="text-xl md:text-2xl font-sans font-medium text-[#181818] pr-3 md:pr-4">
                {product.name}
              </DialogTitle>
              <button
                onClick={() => onOpenChange(false)}
                className="hidden lg:flex text-[#181818] hover:opacity-70 transition-opacity text-xl font-sans leading-none shrink-0"
                aria-label="Закрыть"
              >
                ×
              </button>
            </div>

            <div className="mb-4 md:mb-6 flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-6 md:py-8">
                  <div className="relative w-10 h-10 md:w-12 md:h-12">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-[#FF6600]/20 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-[#FF6600] rounded-full animate-spin"></div>
                  </div>
                </div>
              ) : (
                <p className="text-sm md:text-base font-sans text-[#181818] leading-relaxed">
                  {bouquetDetail?.description || "Описание отсутствует"}
                </p>
              )}
            </div>

            <p className="text-xl md:text-2xl font-sans font-semibold text-[#FF6600] mb-4 md:mb-6">
              {product.price}₽
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 pb-4 lg:pb-0">
              <div className="flex items-center bg-[#FF6600] h-[50px] md:h-[60px] w-full sm:w-[197px] justify-center">
                <button
                  onClick={handleDecrease}
                  className="px-3 md:px-4 h-full text-white cursor-pointer font-sans text-base md:text-lg hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="px-3 md:px-4 h-full flex items-center text-white font-sans text-base md:text-lg min-w-[2.5rem] md:min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrease}
                  className="px-3 md:px-4 h-full text-white cursor-pointer font-sans text-base md:text-lg hover:opacity-80 transition-opacity"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full sm:flex-1 bg-[#FF6600] text-white cursor-pointer sm:min-w-[209px] font-sans text-base md:text-lg font-medium h-[50px] md:h-[60px] px-4 md:px-6 hover:opacity-90 transition-opacity"
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
