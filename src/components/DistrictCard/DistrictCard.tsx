import { Link } from "react-router-dom";
import "./DistrictCard.css";
import { getDistrictPath, type District, type Guardian } from "../../lib/world.js";

export interface DistrictCardProps {
  district: District;
  guardian?: Guardian;
  connectionCount: number;
  repositoryCount?: number;
}

const STATUS_LABEL: Record<District["status"], string> = {
  open: "Open",
  "in-progress": "In Progress",
  locked: "Locked",
};

/**
 * Valley-grid summary of one district. Open districts are real links into
 * `/valley/:slug` — today that only resolves to a built page for
 * "git-forest"; a future district only becomes a link once its own page
 * exists (status flips to "open" and a route is built together, same as
 * this milestone did for Git Forest). Locked/in-progress districts stay
 * non-interactive `<article>`s — no click handler, no dead control.
 */
export function DistrictCard({ district, guardian, connectionCount, repositoryCount }: DistrictCardProps) {
  // "Alive" is derived from a real signal (repositories actually flowing
  // into this district), not a hardcoded district id — any future district
  // that gains synced repositories gets the same treatment automatically.
  const isAlive = !!repositoryCount;
  const isOpen = district.status === "open";
  const isLocked = district.status === "locked";
  const className = `district-card district-card--${district.status}${isAlive ? " district-card--alive" : ""}`;

  const content = (
    <>
      <div className="district-card__header">
        <h3 className="district-card__name">{district.name}</h3>
        <span className="district-card__status">
          {STATUS_LABEL[district.status]}
          {isAlive && <span className="district-card__pulse" aria-hidden="true" />}
        </span>
      </div>

      {district.subtitle && <p className="district-card__subtitle">{district.subtitle}</p>}

      {district.description && <p className="district-card__description">{district.description}</p>}

      <dl className="district-card__stats">
        {!!repositoryCount && (
          <div className="district-card__stat">
            <dt>Repositories</dt>
            <dd>{repositoryCount}</dd>
          </div>
        )}
        <div className="district-card__stat">
          <dt>Connected districts</dt>
          <dd>{connectionCount}</dd>
        </div>
      </dl>

      {guardian && (
        <footer className="district-card__guardian">
          <span className="district-card__guardian-name">{guardian.name}</span>
          {guardian.quote && <p className="district-card__guardian-quote">&ldquo;{guardian.quote}&rdquo;</p>}
        </footer>
      )}

      {isLocked && (
        <div className="district-card__lock-tip" aria-hidden="true">
          <p className="district-card__lock-tip-title">Locked</p>
          <p className="district-card__lock-tip-body">Sealed until its trial is complete.</p>
        </div>
      )}
    </>
  );

  if (isOpen) {
    // The card's own visible content (name, description, guardian quote,
    // ...) would otherwise become this link's accessible name verbatim —
    // an explicit aria-label keeps what's announced concise instead.
    return (
      <Link to={getDistrictPath(district)} className={className} aria-label={`Enter ${district.name}`}>
        {content}
      </Link>
    );
  }

  return <article className={className}>{content}</article>;
}
