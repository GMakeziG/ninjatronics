import "./DistrictCard.css";
import type { District, Guardian } from "../../lib/world.js";

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
 * Presentational summary of one district for the Valley grid. Not yet
 * interactive — there is no district-detail route/DistrictScene to select
 * into, so this deliberately stops short of the spec's onSelect/keyboard
 * affordances rather than wiring a control that goes nowhere. Revisit once
 * a real `/valley/:districtId` destination exists.
 */
export function DistrictCard({ district, guardian, connectionCount, repositoryCount }: DistrictCardProps) {
  return (
    <article className={`district-card district-card--${district.status}`}>
      <div className="district-card__header">
        <h3 className="district-card__name">{district.name}</h3>
        <span className="district-card__status">{STATUS_LABEL[district.status]}</span>
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
    </article>
  );
}
