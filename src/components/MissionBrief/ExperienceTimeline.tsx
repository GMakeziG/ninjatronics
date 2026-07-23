import { useState } from "react";
import type { Experience } from "../../lib/world.js";
import { formatMonthYear } from "../../lib/format-date.js";

export interface ExperienceTimelineProps {
  experiences: Experience[];
}

const COLLAPSED_COUNT = 5;

function formatDateRange(experience: Experience): string {
  const start = formatMonthYear(experience.startDate);
  if (experience.current) return `${start} – Present`;
  if (experience.endDate) return `${start} – ${formatMonthYear(experience.endDate)}`;
  return start;
}

export function ExperienceTimeline({ experiences }: ExperienceTimelineProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? experiences : experiences.slice(0, COLLAPSED_COUNT);
  const hasMore = experiences.length > COLLAPSED_COUNT;

  return (
    <section className="experience-timeline" aria-labelledby="experience-timeline-heading">
      <h2 id="experience-timeline-heading" className="experience-timeline__heading">
        Career Progression
      </h2>

      <ol id="experience-timeline-list" className="experience-timeline__list">
        {visible.map((experience) => (
          <li key={experience.id} className="experience-timeline__item">
            <p className="experience-timeline__dates">{formatDateRange(experience)}</p>
            <h3 className="experience-timeline__role">{experience.role}</h3>
            <p className="experience-timeline__employer">{experience.employer}</p>
            <p className="experience-timeline__summary">{experience.summary}</p>
          </li>
        ))}
      </ol>

      {hasMore && (
        <button
          type="button"
          className="experience-timeline__toggle"
          aria-expanded={expanded}
          aria-controls="experience-timeline-list"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Show recent roles only" : `Show full history (${experiences.length} roles)`}
        </button>
      )}
    </section>
  );
}
