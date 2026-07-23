import { useState } from "react";
import type { Experience, Skill } from "../../lib/world.js";

export interface CurrentMissionProps {
  experience?: Experience;
  skills: Skill[];
}

const COLLAPSED_HIGHLIGHT_COUNT = 3;

export function CurrentMission({ experience, skills }: CurrentMissionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!experience) return null;

  const highlights = experience.highlights ?? [];
  const visibleHighlights = expanded ? highlights : highlights.slice(0, COLLAPSED_HIGHLIGHT_COUNT);
  const hasMoreHighlights = highlights.length > COLLAPSED_HIGHLIGHT_COUNT;

  return (
    <section className="current-mission" aria-labelledby="current-mission-heading">
      <p className="current-mission__eyebrow">Current Mission</p>
      <h2 id="current-mission-heading" className="current-mission__role">
        {experience.role}
      </h2>
      <p className="current-mission__employer">
        {experience.employer}
        {experience.location && ` · ${experience.location}`}
      </p>

      <div id="current-mission-detail" className="current-mission__detail">
        <p className={`current-mission__summary${expanded ? " current-mission__summary--expanded" : ""}`}>
          {experience.summary}
        </p>

        {visibleHighlights.length > 0 && (
          <ul className="current-mission__highlights">
            {visibleHighlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        )}
      </div>

      {(hasMoreHighlights || experience.summary.length > 240) && (
        <button
          type="button"
          className="current-mission__toggle"
          aria-expanded={expanded}
          aria-controls="current-mission-detail"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Show less" : "Read full mission brief"}
        </button>
      )}

      {skills.length > 0 && (
        <ul className="current-mission__skills">
          {skills.map((skill) => (
            <li key={skill.id} className="current-mission__skill-chip">
              {skill.name}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
