import { PopularBouquets } from "@/entities/flowers/ui/popularBouquets";
import { Gallery } from "@/entities/flowers/ui/gallery";
import { HeroBlock } from "@/widgets/heroBlock";
import { AboutWidget } from "@/widgets/aboutWidget";

const DashboardPage = () => {
  return (
    <div className="w-full">
      <HeroBlock />
      <PopularBouquets />
      <Gallery />
      <AboutWidget />
    </div>
  );
};

export default DashboardPage;
