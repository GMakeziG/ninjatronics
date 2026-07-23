import { Link } from "react-router-dom";
import type { District, Guardian } from "../../lib/world.js";

export interface GitForestHeaderProps {
  district: District;
  guardian?: Guardian;
  repositoryCount: number;
}

export function GitForestHeader({ district, guardian, repositoryCount }: GitForestHeaderProps) {
  return (
    <header className="git-forest__header">
      <Link to="/valley" className="git-forest__back-link">
        <span aria-hidden="true">←</span> Back to the Valley
      </Link>

      <div className="git-forest__title-row">
        <h1 className="git-forest__name">{district.name}</h1>
        <span className="git-forest__status">{district.status === "open" ? "Open" : district.status}</span>
      </div>

      {district.subtitle && <p className="git-forest__subtitle">{district.subtitle}</p>}
      {district.description && <p className="git-forest__description">{district.description}</p>}

      <dl className="git-forest__stats">
        <div className="git-forest__stat">
          <dt>Repositories</dt>
          <dd>{repositoryCount}</dd>
        </div>
      </dl>

      {guardian && (
        <div className="git-forest__guardian">
          <p className="git-forest__guardian-name">
            {guardian.name}
            {guardian.title && <span className="git-forest__guardian-title"> — {guardian.title}</span>}
          </p>
          {guardian.quote && <p className="git-forest__guardian-quote">&ldquo;{guardian.quote}&rdquo;</p>}
        </div>
      )}
    </header>
  );
}
