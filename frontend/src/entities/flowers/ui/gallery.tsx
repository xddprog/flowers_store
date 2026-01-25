import { GALLERY_CATEGORIES } from "@/entities/flowers/lib/constants";
import { ERouteNames } from "@/shared/lib/routeVariables";
import { Link } from "react-router-dom";
import { useBouquetTypes } from "../hooks";
import { GalleryCard } from "./galleryCard";

export const Gallery = () => {
  const { data: bouquetTypes } = useBouquetTypes();
  return (
    <section className="w-full bg-[#FFFAF6] py-12 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
          <h2 className="text-2xl md:text-[48px] font-sans font-semibold text-[#181818]">
            Галерея
          </h2>
          <div className="flex flex-col gap-4 lg:max-w-[540px]">
            <p className="text-xl font-sans text-[#181818]">
              В нашей галерее представлены работы в разных стилях — от
              классических монобукетов до современных композиций
            </p>
            <Link
              to={ERouteNames.CATALOG_ROUTE}
              className="bg-[#FF6600] w-[325px] text-white font-sans font-semibold hover:bg-[#E55A00] transition-colors flex items-center justify-center h-[60px] py-4 px-10"
            >
              В каталог
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          {GALLERY_CATEGORIES.map((category) => {
            // const height = index === 1 ? 306 : 465;
            const bouquetType = category.bouquetTypeName
              ? bouquetTypes?.find((type) => type.name === category.bouquetTypeName)
              : undefined;

            return (
              <GalleryCard
                key={category.id}
                category={category}
                height={465}
                bouquetTypeId={bouquetType?.id}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
