export interface NavigationCommand {
  id: string;
  label: string;
  path: string;
  /** Full key sequence, including the `g` prefix, e.g. ["g", "v"]. */
  keys: string[];
}

/**
 * The single source of truth for "go to a real place in the app." Both the
 * keyboard shortcut layer today (`useGlobalShortcuts`) and, later, a
 * Terminal command registry are meant to execute these by `id` and call
 * the same `navigate(path)` — neither owns navigation logic itself.
 *
 * Only routes that exist today are listed here. Do not add a Terminal
 * entry until a real Terminal overlay exists to open.
 */
export const NAVIGATION_COMMANDS: NavigationCommand[] = [
  { id: "home", label: "Gate", path: "/", keys: ["g", "h"] },
  { id: "valley", label: "Valley", path: "/valley", keys: ["g", "v"] },
  { id: "mission-brief", label: "Mission Brief", path: "/brief", keys: ["g", "b"] },
  { id: "git-forest", label: "Git Forest", path: "/valley/git-forest", keys: ["g", "f"] },
  { id: "floating-citadel", label: "Floating Citadel", path: "/valley/floating-citadel", keys: ["g", "c"] },
];

export function getNavigationCommand(id: string): NavigationCommand | undefined {
  return NAVIGATION_COMMANDS.find((command) => command.id === id);
}
