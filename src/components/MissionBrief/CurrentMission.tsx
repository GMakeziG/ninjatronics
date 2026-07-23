import { useState } from "react";
import type { Experience, Skill } from "../../lib/world.js";

export interface CurrentMissionProps {
  experience?: Experience;
  skills: Skill[];
}

const COLLAPSED_HIGHLIGHT_COUNT = 2;
const COLLAPSED_SKILL_COUNT = 8;

export function CurrentMission({ experience, skills }: CurrentMissionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!experience) return null;

  const highlights = experience.highlights ?? [];
  const visibleHighlights = expanded ? highlights : highlights.slice(0, COLLAPSED_HIGHLIGHT_COUNT);
  const hasMoreHighlights = highlights.length > COLLAPSED_HIGHLIGHT_COUNT;

  const visibleSkills = expanded ? skills : skills.slice(0, COLLAPSED_SKILL_COUNT);
  const hiddenSkillCount = skills.length - visibleSkills.length;

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

        {skills.length > 0 && (
          <ul className="current-mission__skills">
            {visibleSkills.map((skill) => (
              <li key={skill.id} className="current-mission__skill-chip">
                {skill.name}
              </li>
            ))}
            {!expanded && hiddenSkillCount > 0 && (
              <li className="current-mission__skill-chip current-mission__skill-chip--more">
                +{hiddenSkillCount} more
              </li>
            )}
          </ul>
        )}
      </div>

      {(hasMoreHighlights || hiddenSkillCount > 0 || experience.summary.length > 240) && (
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
    </section>
  );
}
