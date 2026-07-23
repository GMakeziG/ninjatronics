import "./GateHero.css";

export interface GateHeroProps {
  tagline?: string;
}

/**
 * Static brand identity — "THE CYBER DOJO OF" / "NINJATRONICS" is the
 * site's own name, not world data (same precedent as StatusBar hardcoding
 * "NINJATRONICS.IO"). Only the tagline is real, profile-sourced content.
 */
export function GateHero({ tagline }: GateHeroProps) {
  return (
    <div className="gate-hero">
      <p className="gate-hero__eyebrow">The Cyber Dojo of</p>
      <h1 className="gate-hero__wordmark">
        NINJA<span className="gate-hero__wordmark-accent">TRONICS</span>
      </h1>
      {tagline && <p className="gate-hero__tagline">{tagline}</p>}
    </div>
  );
}
