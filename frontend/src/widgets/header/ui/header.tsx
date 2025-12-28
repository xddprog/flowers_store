import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingBag } from "lucide-react";
import { Image } from "@/shared/ui/image/image";
import { ERouteNames } from "@/shared/lib/routeVariables";
import { BasketModal } from "@/widgets/basket";

export const Header = () => {
  const [isBasketOpen, setIsBasketOpen] = useState(false);

  return (
    <>
      <header className="w-full bg-[#FF6600] border-t border-b border-[#E55A00]">
        <div className="container mx-auto px-8">
          <div className="flex items-center justify-between h-24">
            <Link to={ERouteNames.DEFAULT_ROUTE} className="flex items-center">
              <Image
                src="/images/LASCOVO_white-no-BG-hori 1.png"
                alt="LASCOVO Logo"
                width={179}
                height={24}
                loading="eager"
              />
            </Link>

            <nav className="flex items-center gap-8">
              <Link
                to={ERouteNames.DEFAULT_ROUTE}
                className="text-white font-sans text-xl hover:opacity-80 transition-opacity"
              >
                Главная
              </Link>
              <Link
                to={`/${ERouteNames.DASHBOARD_ROUTE}/${ERouteNames.CATALOG_ROUTE}`}
                className="text-white font-sans text-xl hover:opacity-80 transition-opacity"
              >
                Каталог
              </Link>
              <button
                onClick={() => setIsBasketOpen(true)}
                className="text-white cursor-pointer font-sans text-xl hover:opacity-80 transition-opacity"
              >
                Корзина
              </button>
            </nav>

            <div className="flex items-center gap-6">
              <button
                className="text-white hover:opacity-80 transition-opacity"
                aria-label="Поиск"
              >
                <Search size={32} />
              </button>
              <button
                onClick={() => setIsBasketOpen(true)}
                className="text-white hover:opacity-80 transition-opacity"
                aria-label="Корзина"
              >
                <ShoppingBag size={32} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <BasketModal open={isBasketOpen} onOpenChange={setIsBasketOpen} />
    </>
  );
};
