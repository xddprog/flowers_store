import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AdminSidebar } from "@/widgets/adminSidebar";
import { ERouteNames } from "@/shared/lib/routeVariables";
import { useGetCurrentUser } from "@/entities/admin/hooks";
import { cn } from "@/shared/lib/mergeClass";

const AdminDashboardPage = () => {
  const location = useLocation();
  useGetCurrentUser();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const getActiveSection = (): "orders" | "products" | "users" => {
    if (location.pathname.includes(ERouteNames.ADMIN_PRODUCTS_ROUTE)) {
      return "products";
    }
    if (location.pathname.includes(ERouteNames.ADMIN_USERS_ROUTE)) {
      return "users";
    }
    return "orders";
  };

  const getActiveSectionValue = getActiveSection();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar
        activeSection={getActiveSectionValue}
        isCollapsed={isSidebarCollapsed}
        onCollapseChange={setIsSidebarCollapsed}
      />
      <main
        className={cn(
          "p-8 transition-all duration-300",
          isSidebarCollapsed ? "ml-20" : "ml-64"
        )}
      >
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
