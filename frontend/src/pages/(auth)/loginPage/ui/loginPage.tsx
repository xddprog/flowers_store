import { useNavigate } from "react-router-dom";
import { AdminLoginForm } from "@/entities/admin/ui/adminLoginForm";
import { ERouteNames } from "@/shared/lib/routeVariables";
import { Image } from "@/shared/ui/image/image";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate(`/${ERouteNames.ADMIN_DASHBOARD_ROUTE}`);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-2/3 relative bg-gradient-to-br from-[#FF6600] via-[#FF8533] to-[#FFAA66] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-0 h-0 border-l-[80px] border-l-transparent border-r-[80px] border-r-transparent border-t-[140px] border-t-white/20 rotate-12"></div>
          <div className="absolute top-40 left-60 w-0 h-0 border-l-[60px] border-l-transparent border-r-[60px] border-r-transparent border-t-[100px] border-t-white/15 -rotate-45"></div>
          <div className="absolute bottom-32 left-32 w-0 h-0 border-l-[100px] border-l-transparent border-r-[100px] border-r-transparent border-t-[160px] border-t-white/18 rotate-45"></div>

          <div className="absolute top-60 left-10">
            <div className="w-40 h-0 border-l-[60px] border-l-transparent border-r-[60px] border-r-transparent border-t-[100px] border-t-white/20 rotate-12"></div>
          </div>
          <div className="absolute bottom-40 left-80">
            <div className="w-32 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-t-[80px] border-t-white/15 -rotate-12"></div>
          </div>

          <div className="absolute bottom-20 left-20 w-32 h-32 border border-white/30 rounded-full"></div>
          <div className="absolute bottom-32 left-40 w-24 h-24 border border-white/25 rounded-full bg-white/5"></div>
          <div className="absolute top-32 left-96 w-40 h-40 border border-white/20 rounded-full"></div>
          <div className="absolute top-64 left-80 w-20 h-20 border border-white/25 rounded-full bg-white/10"></div>
          <div className="absolute top-80 right-40 w-36 h-36 border border-white/20 rounded-full"></div>

          <div className="absolute bottom-16 left-64">
            <div className="w-32 h-32 border border-white/30 rounded-full shadow-lg"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-white/35 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 rounded-full shadow-md"></div>
          </div>

          <div className="absolute bottom-40 right-32">
            <div className="w-28 h-28 border border-white/25 rounded-full absolute top-0 left-0"></div>
            <div className="w-28 h-28 border border-white/25 rounded-full absolute top-4 left-4"></div>
          </div>
        </div>

        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <div className="flex flex-col items-center justify-center px-8">
            <Image
              src="/images/LASCOVO-big.png"
              alt="LASCOVO Logo"
              width={400}
              height={76}
              loading="eager"
              className="drop-shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/3 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold text-gray-800 mb-8">Вход</h1>
          <AdminLoginForm onSuccess={handleLoginSuccess} />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
