import { Link } from "react-router-dom";
import { Image } from "@/shared/ui/image/image";
import { ERouteNames } from "@/shared/lib/routeVariables";

export const HeroBlock = () => {
  return (
    <section
      className="relative w-full flex flex-col items-center justify-center min-h-[400px] md:min-h-[500px] lg:min-h-[calc(100vh-98px)]"
      style={{
        height: "calc(100vh - 64px)",
        minHeight: "400px",
        backgroundImage: "url('/images/bg-dashboard.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 flex flex-col items-center justify-center gap-4 md:gap-5 lg:gap-6 px-4 py-8 md:py-12 lg:py-0">
        <Image
          src="/images/LASCOVO_white-no-BG-hori 1.png"
          alt="LASCOVO Logo"
          width={179}
          height={24}
          loading="eager"
          className="mb-1 md:mb-2 block md:hidden w-[160px] h-auto"
        />
        <Image
          src="/images/LASCOVO-big.png"
          alt="LASCOVO Logo"
          width={518}
          height={96}
          loading="eager"
          className="mb-1 md:mb-2 hidden md:block w-[400px] lg:w-[518px] h-auto"
        />

        <p className="text-[#FFFAF6] font-sans text-center text-[16px] md:text-[18px] lg:text-[20px] max-w-2xl px-2 md:px-0 leading-relaxed">
          Широкий ассортимент свежих цветов <br className="hidden md:inline" />и
          уникальных композиций для любого повода
        </p>

        <Link
          to={ERouteNames.CATALOG_ROUTE}
          className="mt-2 md:mt-3 lg:mt-4 bg-[#FF6600] text-white font-sans font-semibold hover:bg-[#E55A00] transition-colors flex items-center justify-center w-[160px] h-[50px] md:w-[170px] md:h-[55px] lg:w-[183px] lg:h-[60px] py-3 md:py-3.5 lg:py-4 px-8 md:px-9 lg:px-10 text-[14px] md:text-[15px] lg:text-base"
        >
          В каталог
        </Link>
      </div>
    </section>
  );
};
