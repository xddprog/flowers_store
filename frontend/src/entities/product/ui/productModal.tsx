import { useBouquetDetail } from "@/entities/flowers/hooks";
import { BaseBouquet, Bouquet } from "@/entities/flowers/types/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/shared/ui/carousel/carousel";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog/dialog";
import { Image } from "@/shared/ui/image/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { data: bouquetDetail, isLoading } = useBouquetDetail(product.id);

  const galleryImages = useMemo(() => {
    if (bouquetDetail?.images && bouquetDetail.images.length > 0) {
      return [...bouquetDetail.images].sort((a, b) => a.order - b.order);
    }
    return product.main_image ? [product.main_image] : [];
  }, [bouquetDetail?.images, product.main_image]);

  const showPrevImage = () =>
    setLightboxIndex((prev) =>
      prev === null
        ? prev
        : (prev - 1 + galleryImages.length) % galleryImages.length
    );

  const showNextImage = () =>
    setLightboxIndex((prev) =>
      prev === null ? prev : (prev + 1) % galleryImages.length
    );

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev === null
            ? prev
            : (prev - 1 + galleryImages.length) % galleryImages.length
        );
      } else if (event.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev === null ? prev : (prev + 1) % galleryImages.length
        );
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, galleryImages.length]);

  const availabilityStatus =
    bouquetDetail?.availability_status ??
    product.availability_status ??
    "in_stock";
  const availabilityLabel =
    availabilityStatus === "in_stock" ? "В наличии" : "Под заказ";

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setLightboxIndex(null);
    }
    onOpenChange(nextOpen);
  };

  const handleAddToCart = () => {
    const imageUrl =
      bouquetDetail?.images && bouquetDetail.images.length > 0
        ? [...bouquetDetail.images].sort((a, b) => a.order - b.order)[0]
            ?.image_path
        : product.main_image?.image_path;

    const basketProduct: Bouquet = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: imageUrl,
    };

    onAddToCart(basketProduct, quantity);
    handleOpenChange(false);
  };

  const lightboxImage =
    lightboxIndex !== null ? galleryImages[lightboxIndex] : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-5xl w-full rounded-none h-full lg:h-auto lg:max-h-[90vh] p-0 lg:p-12 gap-0 border-0 overflow-hidden"
        showCloseButton={false}
        onEscapeKeyDown={(event) => {
          if (lightboxIndex !== null) {
            event.preventDefault();
            setLightboxIndex(null);
          }
        }}
        onInteractOutside={(event) => {
          if (lightboxIndex !== null) {
            event.preventDefault();
          }
        }}
      >
        <button
          onClick={() => handleOpenChange(false)}
          className="lg:hidden fixed top-4 right-5 cursor-pointer z-50 flex items-center justify-center bg-white rounded-full text-[#181818] hover:opacity-70 transition-opacity text-2xl font-sans leading-none"
          aria-label="Закрыть"
        >
          ×
        </button>

        <div className="flex flex-col mt-8 lg:mt-0 lg:flex-row h-full lg:h-auto p-5 lg:p-0">
          <div className="w-full lg:w-1/2 bg-gray-200 aspect-square lg:aspect-auto max-h-[500px] min-h-[300px] md:min-h-[400px] lg:min-h-[400px] relative overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center w-full h-full absolute inset-0">
                <div className="relative w-10 h-10 md:w-12 md:h-12">
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-[#FF6600]/20 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-[#FF6600] rounded-full animate-spin"></div>
                </div>
              </div>
            ) : galleryImages.length > 0 ? (
              <Carousel
                className="w-full h-full"
                opts={{
                  align: "start",
                  loop: galleryImages.length > 1,
                }}
              >
                <CarouselContent className="-ml-0">
                  {galleryImages.map((image, index) => (
                    <CarouselItem key={image.id} className="pl-0 basis-full">
                      <div className="relative aspect-square md:min-h-[400px] lg:min-h-[400px] overflow-hidden bg-gray-200">
                        <Image
                          src={image.image_path}
                          alt={`${product.name} - изображение ${index + 1}`}
                          className="w-full h-full object-cover cursor-zoom-in"
                          loading={index === 0 ? "eager" : "lazy"}
                          onClick={() => setLightboxIndex(index)}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
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
                onClick={() => handleOpenChange(false)}
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

            <div className="mb-4 md:mb-6 flex items-center gap-3">
              <p className="text-xl md:text-2xl font-sans font-semibold text-[#FF6600]">
                {product.price}₽
              </p>
              <span className="inline-block px-3 py-1 text-sm font-medium rounded bg-gray-100 text-gray-700 whitespace-nowrap">
                {availabilityLabel}
              </span>
            </div>

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

      {open &&
        lightboxImage &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 pointer-events-auto"
            role="dialog"
            aria-modal="true"
            aria-label={`${product.name} — просмотр изображения в полном размере`}
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-5 z-[110] cursor-pointer text-white text-4xl font-sans leading-none hover:opacity-70 transition-opacity"
              aria-label="Закрыть просмотр"
            >
              ×
            </button>

            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    showPrevImage();
                  }}
                  className="absolute left-2 md:left-6 z-[110] cursor-pointer text-white p-2 hover:opacity-70 transition-opacity"
                  aria-label="Предыдущее изображение"
                >
                  <ChevronLeft className="size-8 md:size-10" />
                </button>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    showNextImage();
                  }}
                  className="absolute right-2 md:right-6 z-[110] cursor-pointer text-white p-2 hover:opacity-70 transition-opacity"
                  aria-label="Следующее изображение"
                >
                  <ChevronRight className="size-8 md:size-10" />
                </button>
                <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white font-sans text-sm md:text-base">
                  {(lightboxIndex ?? 0) + 1} / {galleryImages.length}
                </span>
              </>
            )}

            <Image
              src={lightboxImage.image_path}
              alt={product.name}
              className="max-w-[92vw] max-h-[92vh] object-contain cursor-zoom-out"
              loading="eager"
            />
          </div>,
          document.body
        )}
    </Dialog>
  );
};
