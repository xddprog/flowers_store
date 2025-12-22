import { Link } from "react-router-dom";
import { Image } from "@/shared/ui/image/image";
import { ERouteNames } from "@/shared/lib/routeVariables";

export const HeroBlock = () => {
  return (
    <section
      className="relative w-full flex flex-col items-center justify-center"
      style={{
        height: "calc(100vh - 98px)",
        backgroundImage: "url('/images/bg-dashboard.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 flex flex-col items-center justify-center gap-6 px-4">
        <Image
          src="/images/LASCOVO-big.png"
          alt="LASCOVO Logo"
          width={518}
          height={96}
          loading="eager"
          className="mb-2"
        />

        <p className="text-[#FFFAF6] font-sans text-center text-[20px] max-w-2xl">
          Широкий ассортимент свежих цветов <br />и уникальных композиций для
          любого повода
        </p>

        <Link
          to={ERouteNames.CATALOG_ROUTE}
          className="mt-4 bg-[#FF6600] text-white font-sans font-semibold hover:bg-[#E55A00] transition-colors flex items-center justify-center w-[183px] h-[60px] py-4 px-10"
        >
          В каталог
        </Link>
      </div>
    </section>
  );
};
