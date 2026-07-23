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
  "/valley/git-forest": "Git Forest",
  "/brief": "Mission Brief",
};

/** Shared with routed pages (Gate today) via <Outlet context>. */
export interface AppShellOutletContext {
  onOpenTerminal: () => void;
  onOpenShortcutHelp: () => void;
}

function useBreadcrumb(): BreadcrumbItem[] {
  const { pathname } = useLocation();

  if (pathname === "/") {
    return [{ label: "Gate", path: "/" }];
  }

  const crumbs: BreadcrumbItem[] = [{ label: "Gate", path: "/" }];

  // Every /valley/* route (only /valley/git-forest exists today) sits
  // under a real "Valley" crumb, not just Gate → itself — so this stays
  // correct as more district pages are added, without per-route wiring.
  if (pathname.startsWith("/valley")) {
    crumbs.push({ label: "Valley", path: "/valley" });
    if (pathname !== "/valley") {
      crumbs.push({ label: ROUTE_LABELS[pathname] ?? pathname, path: pathname });
    }
    return crumbs;
  }

  crumbs.push({ label: ROUTE_LABELS[pathname] ?? pathname, path: pathname });
  return crumbs;
}

export function AppShell() {
  const breadcrumb = useBreadcrumb();
  const districts = listDistricts();
  const districtsOpen = districts.filter((district) => district.status === "open").length;
  const { helpOpen, openHelp, closeHelp } = useGlobalShortcuts();
  const terminal = useTerminal();

  // AppShell is the one place that owns both overlays, so it's the one
  // place exclusivity between them is enforced — opening either one
  // explicitly closes the other, rather than each hook reaching into the
  // other's state (see Design Tokens.md's z-modal > z-docked-overlay
  // ordering for why they'd otherwise visually stack).
  const handleOpenTerminal = () => {
    closeHelp();
    terminal.open();
  };

  const handleOpenShortcutHelp = () => {
    terminal.close();
    openHelp();
  };

  const outletContext: AppShellOutletContext = {
    onOpenTerminal: handleOpenTerminal,
    onOpenShortcutHelp: handleOpenShortcutHelp,
  };

  return (
    <ThemeProvider>
      <StatusBar
        breadcrumb={breadcrumb}
        districtsOpen={districtsOpen}
        districtsTotal={districts.length}
        onOpenTerminal={handleOpenTerminal}
        onOpenShortcutHelp={handleOpenShortcutHelp}
      />
      <NavigationRail />
      <div className="app-shell__content">
        <Outlet context={outletContext} />
      </div>
      <ShortcutHelp open={helpOpen} onClose={closeHelp} commands={NAVIGATION_COMMANDS} />
      <Terminal open={terminal.isOpen} lines={terminal.lines} onClose={terminal.close} onSubmit={terminal.submit} />
    </ThemeProvider>
  );
}
