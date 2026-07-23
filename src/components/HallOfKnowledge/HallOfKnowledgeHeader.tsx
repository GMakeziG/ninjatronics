import { Link } from "react-router-dom";
import type { District, Guardian } from "../../lib/world.js";

export interface HallOfKnowledgeHeaderProps {
  district: District;
  guardian?: Guardian;
  noteCount: number;
  categoryCount: number;
}

const STATUS_LABEL: Record<District["status"], string> = {
  open: "Open",
  "in-progress": "In Progress",
  locked: "Locked",
};

export function HallOfKnowledgeHeader({ district, guardian, noteCount, categoryCount }: HallOfKnowledgeHeaderProps) {
  return (
    <header className="hall-of-knowledge__header">
      <Link to="/valley" className="hall-of-knowledge__back-link">
        <span aria-hidden="true">←</span> Back to the Valley
      </Link>

      <div className="hall-of-knowledge__title-row">
        <h1 className="hall-of-knowledge__name">{district.name}</h1>
        <span className="hall-of-knowledge__status">{STATUS_LABEL[district.status]}</span>
      </div>

      {district.subtitle && <p className="hall-of-knowledge__subtitle">{district.subtitle}</p>}
      {district.description && <p className="hall-of-knowledge__description">{district.description}</p>}

      <div className="hall-of-knowledge__summary">
        <dl className="hall-of-knowledge__stats">
          <div className="hall-of-knowledge__stat">
            <dt>Published Notes</dt>
            <dd>{noteCount}</dd>
          </div>
          <div className="hall-of-knowledge__stat">
            <dt>Categories</dt>
            <dd>{categoryCount}</dd>
          </div>
        </dl>

        {guardian && (
          <div className="hall-of-knowledge__guardian">
            <p className="hall-of-knowledge__guardian-name">
              {guardian.name}
              {guardian.title && <span className="hall-of-knowledge__guardian-title"> — {guardian.title}</span>}
            </p>
            {guardian.quote && <p className="hall-of-knowledge__guardian-quote">&ldquo;{guardian.quote}&rdquo;</p>}
          </div>
        )}
      </div>
    </header>
  );
}
