export interface WorldStatusProps {
  districtsOpen: number;
  districtsTotal: number;
  variant?: "inline" | "stacked";
}

/**
 * Pure formatting of world-state counters. world.json has no dedicated
 * `meta`/`stats` block yet (see docs/design/Component Specification.md's
 * assumed shape vs. src/lib/world.ts) — the caller derives these fields
 * from real district data instead of a placeholder.
 *
 * A ninja-form/progression label is intentionally omitted: there is no
 * validated progression data source yet, and this component only formats
 * real data — it never invents a value.
 */
export function WorldStatus({ districtsOpen, districtsTotal, variant = "inline" }: WorldStatusProps) {
  return (
    <span className={`world-status world-status--${variant}`}>
      <span className="world-status__item">
        {districtsOpen}/{districtsTotal} DISTRICTS OPEN
      </span>
    </span>
  );
}
