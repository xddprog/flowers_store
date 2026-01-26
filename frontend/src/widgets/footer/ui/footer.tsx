import { ERouteNames } from "@/shared/lib/routeVariables";
import { Image } from "@/shared/ui/image/image";
import { Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="w-full bg-[#FF6600] h-full xl:min-h-[380px] flex py-8 md:py-14">
      <div className="container mx-auto w-full px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-12 items-start justify-between">
          <div className="flex flex-col gap-4 md:gap-6 w-full lg:w-auto">
            <Link
              to={ERouteNames.DEFAULT_ROUTE}
              className="flex items-center mb-2"
            >
              <Image
                src="/images/LASCOVO_white-no-BG-hori 1.png"
                alt="LASCOVO Logo"
                width={179}
                height={24}
                className="block md:hidden w-[140px] h-auto"
                loading="eager"
              />
              <Image
                src="/images/LASCOVO-big.png"
                alt="LASCOVO Logo"
                width={413}
                height={55}
                className="hidden md:block w-[350px] lg:w-[413px] h-auto"
                loading="eager"
              />
            </Link>
            <section className="flex flex-col gap-1 md:gap-1.5">
              <div className="flex items-center gap-2">
                <MapPin
                  size={18}
                  className="text-white flex-shrink-0 mt-0.5 md:mt-0 md:size-5"
                />
                <p className="text-white font-sans text-[16px] md:text-[18px] leading-relaxed">
                  Новочерёмушкинская 17, подъезд 4
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Clock
                  size={18}
                  className="text-white flex-shrink-0 mt-0.5 md:mt-0 md:size-5"
                />
                <p className="text-white font-sans text-[16px] md:text-[18px] leading-relaxed">
                  График работы: 10:00-22:00
                </p>
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-3 md:gap-4 w-full lg:w-auto">
            <h3 className="text-white font-sans font-semibold text-[24px] md:text-[28px] lg:text-[32px] mb-1 md:mb-2">
              Покупателям
            </h3>
            <nav className="flex flex-col gap-1.5 md:gap-2">
              <Link
                to={`/${ERouteNames.DASHBOARD_ROUTE}/${ERouteNames.CATALOG_ROUTE}`}
                className="text-white font-sans text-[16px] md:text-[18px] hover:opacity-80 transition-opacity"
              >
                Каталог
              </Link>
              <Link
                to="#"
                className="text-white font-sans text-[16px] md:text-[18px] hover:opacity-80 transition-opacity"
              >
                Политика
              </Link>
              <Link
                to="#"
                className="text-white font-sans text-[16px] md:text-[18px] hover:opacity-80 transition-opacity"
              >
                Возврат и обмен
              </Link>
              <Link
                to="#"
                className="text-white font-sans text-[16px] md:text-[18px] hover:opacity-80 transition-opacity"
              >
                Условия доставки
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-3 md:gap-4 w-full lg:w-auto">
            <h3 className="text-white font-sans font-semibold text-[24px] md:text-[28px] lg:text-[32px] mb-1 md:mb-2">
              Контакты
            </h3>
            <div className="flex flex-col gap-2 md:gap-3">
              <p className="text-white font-sans text-[14px] md:text-[16px] lg:text-[18px]">
                ИНН 772703958796
              </p>
              <p className="text-white font-sans text-[14px] md:text-[16px] lg:text-[18px]">
                ОГРН 324774600482391
              </p>
              <p className="text-white font-sans text-[14px] md:text-[16px] lg:text-[18px] leading-relaxed">
                Юридический адрес: г. Москва <br/>Новочеремушкинская ул., д.17
              </p>
              <div className="flex items-center gap-2">
                <a
                  href="mailto:lavka-schastyal@mail.ru"
                  className="text-white font-sans text-[16px] md:text-[18px] hover:opacity-80 transition-opacity break-all"
                >
                  lavka-schastyal@mail.ru
                </a>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="tel:+79891070703"
                  className="text-white font-sans text-[16px] md:text-[18px] hover:opacity-80 transition-opacity"
                >
                  +7 (989) 107-07-03
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
