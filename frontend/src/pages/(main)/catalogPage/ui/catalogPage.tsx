import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FiltersSidebar } from "@/widgets/catalogFilters";
import { ProductGrid } from "@/entities/product";
import { POPULAR_BOUQUETS } from "@/entities/flowers/lib/constants";
import { ERouteNames } from "@/shared/lib/routeVariables";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select/select";

const CatalogPage = () => {
  const [sortBy, setSortBy] = useState("popularity");

  const products = [
    ...POPULAR_BOUQUETS,
    ...POPULAR_BOUQUETS,
    ...POPULAR_BOUQUETS,
  ];

  return (
    <div className="w-full my-12 mt-16">
      <div className="container mx-auto">
        <div className="mb-10 gap-3 flex flex-col">
          <Link
            to={ERouteNames.DEFAULT_ROUTE}
            className="flex items-center gap-2 text-base font-sans text-[#181818] hover:opacity-80 transition-opacity mb-4"
          >
            <ArrowLeft size={20} />
            <span>Главная</span>
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-[56px] font-sans text-[#181818]">
              Каталог
            </h1>
            <div className="flex items-center gap-1">
              <span className="text-base font-sans text-[#181818]">
                Сортировать по
              </span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-0 shadow-none p-0 h-auto w-auto gap-1 focus:ring-0 focus-visible:ring-0 bg-transparent hover:bg-transparent data-[state=open]:bg-transparent text-base font-sans text-[#181818] [&_svg]:opacity-100 [&_svg]:text-[#181818]">
                  <SelectValue placeholder="По популярности" />
                </SelectTrigger>
                <SelectContent side="bottom" align="end" position="popper">
                  <SelectItem value="popularity">популярности</SelectItem>
                  <SelectItem value="price-low">наименьшей цене</SelectItem>
                  <SelectItem value="price-high">наибольшей цене</SelectItem>
                </SelectContent>
              </Select>
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
