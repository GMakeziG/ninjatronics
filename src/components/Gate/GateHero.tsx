import "./GateHero.css";

export interface GateHeroProps {
  tagline?: string;
  /**
   * Arms the wordmark's one-shot glitch (see GateHero.css). Only ever
   * true during a genuine first-visit boot, in progress — Gate.tsx
   * disarms it once boot completes or skips, so an interrupted/skipped
   * boot never leaves a stray glitch scheduled to fire later.
   */
  glitchActive?: boolean;
}

/**
 * Static brand identity — "THE CYBER DOJO OF" / "NINJATRONICS" is the
 * site's own name, not world data (same precedent as StatusBar hardcoding
 * "NINJATRONICS.IO"). Only the tagline is real, profile-sourced content.
 */
export function GateHero({ tagline, glitchActive = false }: GateHeroProps) {
  return (
    <div className="gate-hero">
      <p className="gate-hero__eyebrow">The Cyber Dojo of</p>
      <h1 className={`gate-hero__wordmark${glitchActive ? " gate-hero__wordmark--glitch" : ""}`}>
        NINJA<span className="gate-hero__wordmark-accent">TRONICS</span>
      </h1>
      {tagline && <p className="gate-hero__tagline">{tagline}</p>}
    </div>
  );
}
