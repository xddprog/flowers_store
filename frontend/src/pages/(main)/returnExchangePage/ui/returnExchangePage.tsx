import { ERouteNames } from "@/shared/lib/routeVariables";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ReturnExchangePage = () => {
  return (
    <div className="w-full my-8 mt-6 md:my-12 md:mt-12 lg:mt-16 container mx-auto px-4 md:px-8">
      <div className="container mx-auto">
        <div className="mb-6 md:mb-10 gap-3 flex flex-col">
          <Link
            to={ERouteNames.DEFAULT_ROUTE}
            className="flex items-center gap-2 text-sm md:text-base font-sans text-[#181818] hover:opacity-80 transition-opacity mb-3 md:mb-4"
          >
            <ArrowLeft size={18} className="md:size-5" />
            <span>Главная</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[56px] font-sans text-[#181818]">
            Возврат и обмен
          </h1>
        </div>

        <div className="max-w-3xl">
          <p className="text-base md:text-lg font-sans text-[#181818] leading-relaxed">
            В соответствии с Законом Российской Федерации «О защите прав
            потребителей» от 07.02.1992 № 2300-1 (в ред. от 25.10.2007 г.) и
            Постановлением Правительства Российской Федерации от 19.01.1998
            № 55 (в ред. от 27.03.2007 г.) срезанные цветы и горшечные
            растения не подлежат обмену и возврату (указаны в Перечне
            непродовольственных товаров надлежащего качества, не подлежащих
            возврату или обмену).
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReturnExchangePage;
