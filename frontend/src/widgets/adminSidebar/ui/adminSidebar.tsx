import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Box, Users, ShoppingCart } from "lucide-react";
import { Image } from "@/shared/ui/image/image";
import { cn } from "@/shared/lib/mergeClass";
import { ERouteNames } from "@/shared/lib/routeVariables";

interface AdminSidebarProps {
  activeSection?: "orders" | "products" | "users";
  isCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

export const AdminSidebar = ({
  activeSection = "orders",
  isCollapsed: externalIsCollapsed,
  onCollapseChange,
}: AdminSidebarProps) => {
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  
  const isCollapsed = externalIsCollapsed !== undefined 
    ? externalIsCollapsed 
    : internalIsCollapsed;

  const toggleCollapse = () => {
    const newValue = !isCollapsed;
    if (onCollapseChange) {
      onCollapseChange(newValue);
    } else {
      setInternalIsCollapsed(newValue);
    }
  };

  const menuItems = [
    {
      id: "orders" as const,
      label: "Заказы",
      icon: ShoppingCart,
      path: `/${ERouteNames.ADMIN_DASHBOARD_ROUTE}/${ERouteNames.ADMIN_ORDERS_ROUTE}`,
    },
    {
      id: "products" as const,
      label: "Продукты",
      icon: Box,
      path: `/${ERouteNames.ADMIN_DASHBOARD_ROUTE}/${ERouteNames.ADMIN_PRODUCTS_ROUTE}`,
    },
    {
      id: "users" as const,
      label: "Пользователи",
      icon: Users,
      path: `/${ERouteNames.ADMIN_DASHBOARD_ROUTE}/${ERouteNames.ADMIN_USERS_ROUTE}`,
    },
  ];

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-screen bg-[#FAFAFA] border-r border-gray-200 flex flex-col transition-all duration-300 z-10",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6">
        <div className="flex items-center justify-start">
          <Image
            src="/images/lascovo-black.png"
            alt="LASCOVO Logo"
            className={cn(
              "transition-opacity duration-300",
              isCollapsed ? "w-8 h-8" : "w-32 h-auto"
            )}
            loading="eager"
          />
        </div>
      </div>

      <nav className="flex-1 px-6 py-2 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "w-full flex items-center gap-3 py-1.5 rounded-lg transition-colors duration-200 cursor-pointer",
                isActive ? "text-[#FF6600]" : "text-gray-700",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                size={22}
                className={cn(
                  "flex-shrink-0 transition-colors duration-200",
                  isActive ? "text-[#FF6600]" : "text-gray-700"
                )}
              />
              {!isCollapsed && (
                <span
                  className={cn(
                    "text-[15px]",
                    isActive ? "text-[#FF6600]" : "text-gray-700"
                  )}
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <button
          onClick={toggleCollapse}
          className={cn(
            "cursor-pointer flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-700 rounded-lg transition-colors duration-200",
            isCollapsed && "justify-center"
          )}
          title={isCollapsed ? "Развернуть меню" : "Свернуть меню"}
        >
          <ChevronLeft
            size={20}
            className={cn(
              "transition-transform duration-300 flex-shrink-0",
              isCollapsed && "rotate-180"
            )}
          />
        </button>
      </div>
    </aside>
  );
};
