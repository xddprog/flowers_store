import { Image } from "@/shared/ui/image/image";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "@/widgets/header";

const RootPage = () => {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <Image
            alt="logo-suspense"
            src="/images/logo.jpg"
            className="w-6 h-6 rounded-sm animate-ping"
          />
        </div>
      }
    >
      <div className="h-screen relative flex flex-col">
        <Header />
        <main className="w-full flex-1">
          <Outlet />
        </main>
      </div>
    </Suspense>
  );
};

export default RootPage;
