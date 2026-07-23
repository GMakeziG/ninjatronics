import { Link } from "react-router-dom";
import { getDistrictPath, type District } from "../../lib/world.js";

export interface ExploreWorldProps {
  districts: District[];
}

const STATUS_LABEL: Record<District["status"], string> = {
  open: "Open",
  "in-progress": "In Progress",
  locked: "Locked",
};

/**
 * The exploration handoff from Mission Brief into the rest of the world.
 * Git Forest is the only real destination today — everything here is
 * driven by each district's real `status` field, not a hardcoded list of
 * which ones are "ready." A locked district renders as a plain, inert row
 * (never a link) the same way DistrictCard treats locked districts on the
 * Valley grid — no dead links, no simulated interactivity.
 */
export function ExploreWorld({ districts }: ExploreWorldProps) {
  // Open districts surface first — a data-driven "here's what's real today"
  // ordering, not a hand-picked sequence of names.
  const sorted = [...districts].sort(
    (a, b) => Number(b.status === "open") - Number(a.status === "open"),
  );

  return (
    <section className="explore-world" aria-labelledby="explore-world-heading">
      <h2 id="explore-world-heading" className="explore-world__heading">
        Explore the World
      </h2>
      <ul className="explore-world__list">
        {sorted.map((district) => (
          <li key={district.id} className="explore-world__item">
            {district.status === "open" ? (
              <Link to={getDistrictPath(district)} className="explore-world__row explore-world__row--open">
                <span className="explore-world__name">{district.name}</span>
                {district.subtitle && <span className="explore-world__subtitle">{district.subtitle}</span>}
                <span className="explore-world__status">{STATUS_LABEL[district.status]}</span>
              </Link>
            ) : (
              <div className="explore-world__row explore-world__row--locked" aria-disabled="true">
                <span className="explore-world__name">{district.name}</span>
                {district.subtitle && <span className="explore-world__subtitle">{district.subtitle}</span>}
                <span className="explore-world__status">{STATUS_LABEL[district.status]}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
