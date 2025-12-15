import { Link } from "react-router-dom";
import { Search, ShoppingBag } from "lucide-react";
import { Image } from "@/shared/ui/image/image";
import { ERouteNames } from "@/shared/lib/routeVariables";

export const Header = () => {
  return (
    <header className="w-full bg-[#FF6600] border-t border-b border-[#E55A00]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <Link to={ERouteNames.DEFAULT_ROUTE} className="flex items-center">
            <Image
              src="/images/LASCOVO_white-no-BG-hori 1.png"
              alt="LASCOVO Logo"
              className="h-8 w-auto"
              loading="eager"
            />
          </Link>

          {/* Навигация */}
          <nav className="flex items-center gap-8">
            <Link
              to={ERouteNames.DEFAULT_ROUTE}
              className="text-white font-sans text-base hover:opacity-80 transition-opacity"
            >
              Главная
            </Link>
            <Link
              to="#"
              className="text-white font-sans text-base hover:opacity-80 transition-opacity"
            >
              Каталог
            </Link>
            <Link
              to="#"
              className="text-white font-sans text-base hover:opacity-80 transition-opacity"
            >
              Корзина
            </Link>
          </nav>

          {/* Иконки */}
          <div className="flex items-center gap-4">
            <button
              className="text-white hover:opacity-80 transition-opacity"
              aria-label="Поиск"
            >
              <Search size={20} />
            </button>
            <button
              className="text-white hover:opacity-80 transition-opacity"
              aria-label="Корзина"
            >
              <ShoppingBag size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
