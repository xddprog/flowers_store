import RootPage from "./(main)/rootPage";
import ErrorPage from "./(main)/errorPage";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { lazy } from "react";
import AuthPage from "./(auth)/authPage";
import { ERouteNames } from "@/shared/lib/routeVariables";
import { privatePage } from "@/entities/viewer/lib";
import { routesWithHoc } from "@/shared/lib/routesWithHoc";

const DashboardPage = lazy(() => import("@/pages/(main)/dashboardPage"));
const CatalogPage = lazy(() => import("@/pages/(main)/catalogPage"));
const LoginPage = lazy(() => import("@/pages/(auth)/loginPage"));
const AdminDashboardPage = lazy(
  () => import("@/pages/(main)/adminDashboardPage")
);
const AdminOrdersPage = lazy(() => import("@/pages/(main)/adminOrdersPage"));
const AdminProductsPage = lazy(
  () => import("@/pages/(main)/adminProductsPage")
);
const AdminUsersPage = lazy(() => import("@/pages/(main)/adminUsersPage"));
const AdminProductDetailPage = lazy(
  () => import("@/pages/(main)/adminProductDetailPage")
);

export const routes = createBrowserRouter([
  {
    path: ERouteNames.DEFAULT_ROUTE,
    element: <RootPage />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: ERouteNames.EMPTY_ROUTE,
        element: <Outlet />,
        children: [
          {
            path: ERouteNames.EMPTY_ROUTE,
            element: <Navigate to={ERouteNames.DASHBOARD_ROUTE} replace />,
          },
          {
            path: ERouteNames.DASHBOARD_ROUTE,
            element: <Outlet />,
            children: [
              {
                path: ERouteNames.EMPTY_ROUTE,
                element: <DashboardPage />,
              },
              {
                path: ERouteNames.CATALOG_ROUTE,
                element: <CatalogPage />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: ERouteNames.AUTH_ROUTE,
    element: <AuthPage />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: ERouteNames.EMPTY_ROUTE,
        element: <Navigate to={ERouteNames.LOGIN_ROUTE} replace />,
      },
      {
        path: ERouteNames.LOGIN_ROUTE,
        element: <LoginPage />,
      },
    ],
  },
  {
    path: ERouteNames.ADMIN_DASHBOARD_ROUTE,
    element: <AdminDashboardPage />,
    errorElement: <ErrorPage />,
    children: [
      ...routesWithHoc(privatePage, [
        {
          path: ERouteNames.EMPTY_ROUTE,
          element: <Navigate to={ERouteNames.ADMIN_ORDERS_ROUTE} replace />,
        },
        {
          path: ERouteNames.ADMIN_ORDERS_ROUTE,
          element: <AdminOrdersPage />,
        },
        {
          path: ERouteNames.ADMIN_PRODUCTS_ROUTE,
          element: <Outlet />,
          children: [
            {
              path: ERouteNames.EMPTY_ROUTE,
              element: <AdminProductsPage />,
            },
            {
              path: ERouteNames.ADMIN_PRODUCT_DETAIL_ROUTE,
              element: <AdminProductDetailPage />,
            },
          ],
        },
        {
          path: ERouteNames.ADMIN_USERS_ROUTE,
          element: <AdminUsersPage />,
        },
      ]),
    ],
  },
]);
