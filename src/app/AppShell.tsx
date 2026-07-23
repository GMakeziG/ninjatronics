import { Outlet, useLocation } from "react-router-dom";
import "./AppShell.css";
import { ThemeProvider } from "./theme/ThemeProvider.js";
import { StatusBar } from "../components/StatusBar/StatusBar.js";
import { NavigationRail } from "../components/NavigationRail/NavigationRail.js";
import { ShortcutHelp } from "../components/ShortcutHelp/ShortcutHelp.js";
import { Terminal } from "../components/Terminal/Terminal.js";
import { listDistricts, getCertification } from "../lib/world.js";
import { getRepositoryTree } from "../lib/git-forest.js";
import { getKnowledgeNote } from "../lib/knowledge.js";
import type { BreadcrumbItem } from "../components/StatusBar/Breadcrumbs.js";
import { useGlobalShortcuts } from "./navigation/useGlobalShortcuts.js";
import { NAVIGATION_COMMANDS } from "./navigation/navigationCommands.js";
import { useTerminal } from "./terminal/useTerminal.js";

const ROUTE_LABELS: Record<string, string> = {
  "/valley": "Valley",
  "/valley/git-forest": "Git Forest",
  "/valley/floating-citadel": "Floating Citadel",
  "/valley/hall-of-knowledge": "Hall of Knowledge",
  "/brief": "Mission Brief",
};

/** Tries every known artifact kind for a leaf segment under a district
 * route — repository, then certification, then knowledge note. Each
 * district's artifacts live in a separate id/slug namespace, so trying all
 * three in sequence is safe; returns undefined (no 4th crumb) if none
 * resolve. */
function resolveArtifactLabel(slug: string): string | undefined {
  return getRepositoryTree(slug)?.treeName ?? getCertification(slug)?.name ?? getKnowledgeNote(slug)?.title;
}

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

  // Every /valley/* route sits under a real "Valley" crumb, not just
  // Gate → itself. /valley/:district/:artifactSlug additionally resolves
  // the real artifact name (repository or certification) for its own
  // crumb — falling back to no 4th crumb, not a fabricated label, when
  // the slug doesn't resolve to anything real; the artifact page itself
  // renders NotFound in that case.
  if (pathname.startsWith("/valley")) {
    crumbs.push({ label: "Valley", path: "/valley" });
    if (pathname === "/valley") return crumbs;

    const segments = pathname.split("/").filter(Boolean);
    const districtPath = `/valley/${segments[1]}`;
    crumbs.push({ label: ROUTE_LABELS[districtPath] ?? segments[1], path: districtPath });

    if (segments[2]) {
      const artifactLabel = resolveArtifactLabel(segments[2]);
      if (artifactLabel) {
        crumbs.push({ label: artifactLabel, path: pathname });
      }
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
