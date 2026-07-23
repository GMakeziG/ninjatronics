import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import "./AppShell.css";
import { ThemeProvider } from "./theme/ThemeProvider.js";
import { StatusBar } from "../components/StatusBar/StatusBar.js";
import { NavigationRail } from "../components/NavigationRail/NavigationRail.js";
import { ShortcutHelp } from "../components/ShortcutHelp/ShortcutHelp.js";
import { Terminal } from "../components/Terminal/Terminal.js";
import { listDistricts } from "../lib/world.js";
import type { BreadcrumbItem } from "../components/StatusBar/Breadcrumbs.js";
import { useGlobalShortcuts } from "./navigation/useGlobalShortcuts.js";
import { NAVIGATION_COMMANDS } from "./navigation/navigationCommands.js";
import { useTerminal } from "./terminal/useTerminal.js";

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
  const terminal = useTerminal();

  // The terminal's own input already suspends global shortcuts once it has
  // focus (isEditableTarget), but the shortcut-help overlay is a separate,
  // higher-stacked modal (z-modal > z-docked-overlay per Design Tokens.md)
  // that could otherwise sit on top of the terminal if both happened to be
  // open — close it as a courtesy when the terminal opens.
  useEffect(() => {
    if (terminal.isOpen) closeHelp();
  }, [terminal.isOpen, closeHelp]);

  return (
    <ThemeProvider>
      <StatusBar breadcrumb={breadcrumb} districtsOpen={districtsOpen} districtsTotal={districts.length} />
      <NavigationRail />
      <div className="app-shell__content">
        <Outlet />
      </div>
      <ShortcutHelp open={helpOpen} onClose={closeHelp} commands={NAVIGATION_COMMANDS} />
      <Terminal open={terminal.isOpen} lines={terminal.lines} onClose={terminal.close} onSubmit={terminal.submit} />
    </ThemeProvider>
  );
}
