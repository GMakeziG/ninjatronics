export interface NavDestination {
  id: string;
  label: string;
  to: string;
}

/**
 * The single place global navigation destinations are configured. Oracle,
 * Terminal, and Search are designed as overlay modes (Component
 * Specification.md) but have no implementation yet, so they are
 * intentionally absent here rather than rendered as dead controls. When
 * one ships, add an entry here — `NavigationRail` itself does not need to
 * change.
 */
export const navDestinations: NavDestination[] = [
  { id: "world", label: "World", to: "/valley" },
  { id: "brief", label: "Mission Brief", to: "/brief" },
];
