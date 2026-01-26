import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Menu, X } from "lucide-react";
import { Image } from "@/shared/ui/image/image";
import { ERouteNames } from "@/shared/lib/routeVariables";
import { BasketModal } from "@/features/basket";
import { cn } from "@/shared/lib/mergeClass";

export const Header = () => {
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenModal = () => setIsBasketOpen(true);
  const handleToggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleCloseMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="w-full bg-[#FF6600] border-t border-b border-[#E55A00]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 lg:h-24">
            <Link
              to={ERouteNames.DEFAULT_ROUTE}
              className="flex items-center"
              onClick={handleCloseMobileMenu}
            >
              <Image
                src="/images/LASCOVO_white-no-BG-hori 1.png"
                alt="LASCOVO Logo"
                width={179}
                height={24}
                className="w-[120px] h-auto md:w-[150px] lg:w-[179px]"
                loading="eager"
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
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
                onClick={handleOpenModal}
                className="text-white cursor-pointer font-sans text-xl hover:opacity-80 transition-opacity"
              >
                Корзина
              </button>
            </nav>

            <div className="flex items-center gap-3 md:gap-4 lg:gap-6">
              {/* <button
                className="hidden lg:flex text-white hover:opacity-80 transition-opacity"
                aria-label="Поиск"
              >
                <Search size={24} className="md:size-7 lg:size-8" />
              </button> */}
              <button
                onClick={handleOpenModal}
                className="hidden lg:flex text-white cursor-pointer hover:opacity-80 transition-opacity relative"
                aria-label="Корзина"
              >
                <ShoppingBag size={24} className="md:size-7 lg:size-8" />
              </button>
              <button
                onClick={handleToggleMobileMenu}
                className="text-white hover:opacity-80 transition-opacity lg:hidden"
                aria-label="Меню"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X size={24} className="md:size-6" />
                ) : (
                  <Menu size={24} className="md:size-6" />
                )}
              </button>
            </div>
          </div>

          {/* Мобильное меню */}
          <div
            className={cn(
              "lg:hidden overflow-hidden transition-all duration-300 ease-in-out",
              isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <nav className="flex flex-col gap-4 pb-4 pt-2">
              <Link
                to={ERouteNames.DEFAULT_ROUTE}
                onClick={handleCloseMobileMenu}
                className="text-white font-sans text-lg md:text-xl hover:opacity-80 transition-opacity py-2"
              >
                Главная
              </Link>
              <Link
                to={`/${ERouteNames.DASHBOARD_ROUTE}/${ERouteNames.CATALOG_ROUTE}`}
                onClick={handleCloseMobileMenu}
                className="text-white font-sans text-lg md:text-xl hover:opacity-80 transition-opacity py-2"
              >
                Каталог
              </Link>
              <button
                onClick={() => {
                  handleOpenModal();
                  handleCloseMobileMenu();
                }}
                className="text-white cursor-pointer font-sans text-lg md:text-xl hover:opacity-80 transition-opacity text-left py-2"
              >
                Корзина
              </button>
            </nav>
          </div>
        </div>
      </header>

      <BasketModal open={isBasketOpen} onOpenChange={setIsBasketOpen} />
    </>
  );
};
