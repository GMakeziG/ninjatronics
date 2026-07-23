import { Link } from "react-router-dom";
import type { District, Guardian } from "../../lib/world.js";

export interface FloatingCitadelHeaderProps {
  district: District;
  guardian?: Guardian;
  certificationCount: number;
}

const STATUS_LABEL: Record<District["status"], string> = {
  open: "Open",
  "in-progress": "In Progress",
  locked: "Locked",
};

export function FloatingCitadelHeader({ district, guardian, certificationCount }: FloatingCitadelHeaderProps) {
  return (
    <header className="floating-citadel__header">
      <Link to="/valley" className="floating-citadel__back-link">
        <span aria-hidden="true">←</span> Back to the Valley
      </Link>

      <div className="floating-citadel__title-row">
        <h1 className="floating-citadel__name">{district.name}</h1>
        <span className="floating-citadel__status">{STATUS_LABEL[district.status]}</span>
      </div>

      {district.subtitle && <p className="floating-citadel__subtitle">{district.subtitle}</p>}
      {district.description && <p className="floating-citadel__description">{district.description}</p>}

      <div className="floating-citadel__summary">
        <dl className="floating-citadel__stats">
          <div className="floating-citadel__stat">
            <dt>Certifications</dt>
            <dd>{certificationCount}</dd>
          </div>
        </dl>

        {guardian && (
          <div className="floating-citadel__guardian">
            <p className="floating-citadel__guardian-name">
              {guardian.name}
              {guardian.title && <span className="floating-citadel__guardian-title"> — {guardian.title}</span>}
            </p>
            {guardian.quote && <p className="floating-citadel__guardian-quote">&ldquo;{guardian.quote}&rdquo;</p>}
          </div>
        )}
      </div>
    </header>
  );
}
