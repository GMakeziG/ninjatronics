export interface WorldStatusProps {
  ninjaFormName: string;
  districtsOpen: number;
  districtsTotal: number;
  variant?: "inline" | "stacked";
}

/**
 * Pure formatting of world-state counters. world.json has no dedicated
 * `meta`/`stats` block yet (see docs/design/Component Specification.md's
 * assumed shape vs. src/lib/world.ts) — the caller derives these fields
 * from real district data instead of a placeholder.
 */
export function WorldStatus({ ninjaFormName, districtsOpen, districtsTotal, variant = "inline" }: WorldStatusProps) {
  return (
    <span className={`world-status world-status--${variant}`}>
      <span className="world-status__item">FORM · {ninjaFormName}</span>
      <span className="world-status__divider" aria-hidden="true">
        ·
      </span>
      <span className="world-status__item">
        {districtsOpen}/{districtsTotal} DISTRICTS OPEN
      </span>
    </span>
  );
}
