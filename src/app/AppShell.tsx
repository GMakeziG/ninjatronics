import { Outlet, useLocation } from "react-router-dom";
import "./AppShell.css";
import { ThemeProvider } from "./theme/ThemeProvider.js";
import { StatusBar } from "../components/StatusBar/StatusBar.js";
import { NavigationRail } from "../components/NavigationRail/NavigationRail.js";
import { ShortcutHelp } from "../components/ShortcutHelp/ShortcutHelp.js";
import { listDistricts } from "../lib/world.js";
import type { BreadcrumbItem } from "../components/StatusBar/Breadcrumbs.js";
import { useGlobalShortcuts } from "./navigation/useGlobalShortcuts.js";
import { NAVIGATION_COMMANDS } from "./navigation/navigationCommands.js";

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
  const { helpOpen, closeHelp } = useGlobalShortcuts();

  return (
    <ThemeProvider>
      <StatusBar breadcrumb={breadcrumb} districtsOpen={districtsOpen} districtsTotal={districts.length} />
      <NavigationRail />
      <div className="app-shell__content">
        <Outlet />
      </div>
      <ShortcutHelp open={helpOpen} onClose={closeHelp} commands={NAVIGATION_COMMANDS} />
    </ThemeProvider>
  );
}
