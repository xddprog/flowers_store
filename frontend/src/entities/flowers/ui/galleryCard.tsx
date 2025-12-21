import { Image } from "@/shared/ui/image/image";
import { GalleryCategory } from "../types/types";

interface GalleryCardProps {
  category: GalleryCategory;
  height?: number;
}

export const GalleryCard = ({ category, height }: GalleryCardProps) => {
  return (
    <div className="flex flex-col">
      <div
        className="w-full bg-gray-200 mb-4 flex items-center justify-center"
        style={{ height: height ? `${height}px` : undefined }}
      >
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>
      <h3 className="text-[32px] font-sans font-medium text-[#181818]">
        {category.name}
      </h3>
    </div>
  );
};
