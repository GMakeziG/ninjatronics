import { Outlet, useLocation } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeProvider.js";
import { StatusBar } from "../components/StatusBar/StatusBar.js";
import { listDistricts } from "../lib/world.js";
import type { BreadcrumbItem } from "../components/StatusBar/Breadcrumbs.js";

const ROUTE_LABELS: Record<string, string> = {
  "/valley": "Valley",
  "/brief": "Mission Brief",
};

function useBreadcrumb(): BreadcrumbItem[] {
  const location = useLocation();

  if (location.pathname === "/") {
    return [{ label: "Gate", path: "/" }];
  }

  return [
    { label: "Gate", path: "/" },
    { label: ROUTE_LABELS[location.pathname] ?? location.pathname, path: location.pathname },
  ];
}

export function AppShell() {
  const breadcrumb = useBreadcrumb();
  const districts = listDistricts();
  const districtsOpen = districts.filter((district) => district.status === "open").length;

  return (
    <ThemeProvider>
      <StatusBar
        breadcrumb={breadcrumb}
        ninjaFormName="Apprentice"
        districtsOpen={districtsOpen}
        districtsTotal={districts.length}
      />
      <Outlet />
    </ThemeProvider>
  );
}
