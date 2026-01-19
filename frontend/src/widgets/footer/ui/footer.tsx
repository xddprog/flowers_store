import { ERouteNames } from "@/shared/lib/routeVariables";
import { Image } from "@/shared/ui/image/image";
import { Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="w-full bg-[#FF6600] md:min-h-[380px] flex items-center">
      <div className="container mx-auto px-8 md:px-0 py-8 w-full">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start justify-between">
          <div className="flex flex-col gap-6">
            <Link
              to={ERouteNames.DEFAULT_ROUTE}
              className="flex items-center mb-2"
            >
              <Image
                src="/images/LASCOVO-big.png"
                alt="LASCOVO Logo"
                width={413}
                height={55}
                loading="eager"
              />
            </Link>
            <section className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <MapPin size={20} className="text-white flex-shrink-0" />
                <p className="text-white font-sans text-[20px]">
                  Новочерёмушкинская 17, подъезд 4
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-white flex-shrink-0" />
                <p className="text-white font-sans text-[20px]">
                  График работы: 10:00-22:00
                </p>
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-white font-sans font-semibold text-[32px] mb-2">
              Покупателям
            </h3>
            <nav className="flex flex-col gap-2">
              <Link
                to="#"
                className="text-white font-sans text-[20px] hover:opacity-80 transition-opacity"
              >
                Каталог
              </Link>
              <Link
                to="#"
                className="text-white font-sans text-[20px] hover:opacity-80 transition-opacity"
              >
                Политика
              </Link>
              <Link
                to="#"
                className="text-white font-sans text-[20px] hover:opacity-80 transition-opacity"
              >
                Возврат и обмен
              </Link>
              <Link
                to="#"
                className="text-white font-sans text-[20px] hover:opacity-80 transition-opacity"
              >
                Условия доставки
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-white font-sans font-semibold text-[32px] mb-2">
              Контакты
            </h3>
            <div className="flex flex-col gap-3">
              <p className="text-white font-sans text-[18px]">
                Индивидуальный предприниматель Сайкова Татьяна Владимировна
              </p>
              <p className="text-white font-sans text-[18px]">
                ИНН 772703958796
              </p>
              <p className="text-white font-sans text-[18px]">
                ОГРН 324774600482391
              </p>
              <p className="text-white font-sans text-[18px]">
                Юридический адрес: г. Москва, Новочеремушкинская ул., д.17
              </p>
              <div className="flex items-center gap-2">
                <a
                  href="mailto:lavka-schastyal@mail.ru"
                  className="text-white font-sans text-[20px] hover:opacity-80 transition-opacity"
                >
                  lavka-schastyal@mail.ru
                </a>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="tel:+79891070703"
                  className="text-white font-sans text-[20px] hover:opacity-80 transition-opacity"
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
