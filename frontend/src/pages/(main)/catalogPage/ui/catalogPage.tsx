import { Link } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { FiltersSidebar } from "@/widgets/catalogFilters";
import { ProductGrid } from "@/entities/product";
import { POPULAR_BOUQUETS } from "@/entities/flowers/lib/constants";
import { ERouteNames } from "@/shared/lib/routeVariables";

const CatalogPage = () => {
  const products = [
    ...POPULAR_BOUQUETS,
    ...POPULAR_BOUQUETS,
    ...POPULAR_BOUQUETS,
  ];

  return (
    <div className="w-full my-12 mt-24">
      <div className="container mx-auto">
        <div className="mb-12 gap-3 flex flex-col">
          <Link
            to={ERouteNames.DEFAULT_ROUTE}
            className="flex items-center gap-2 text-base font-sans text-[#181818] hover:opacity-80 transition-opacity mb-4"
          >
            <ArrowLeft size={20} />
            <span>Главная</span>
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-sans font-semibold text-[#181818]">
              Каталог
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-base font-sans text-[#181818]">
                Сортировать по
              </span>
              <button>
                <ChevronDown size={20} className="text-[#181818]" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <FiltersSidebar />

          <div className="flex-1">
            <ProductGrid products={products} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;
