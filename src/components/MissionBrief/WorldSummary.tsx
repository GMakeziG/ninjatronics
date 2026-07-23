export interface WorldSummaryCounts {
  experiences: number;
  skills: number;
  certifications: number;
  repositories: number;
  districtsOpen: number;
  districtsTotal: number;
}

export interface WorldSummaryProps {
  counts: WorldSummaryCounts;
}

/**
 * Real, derived counts only — no invented uptime, ranking, or mastery
 * scoring. Every value here is a `.length` (or an "open" filter) over an
 * existing compiled collection.
 */
export function WorldSummary({ counts }: WorldSummaryProps) {
  const stats: { label: string; value: string }[] = [
    { label: "Roles Documented", value: String(counts.experiences) },
    { label: "Skills Catalogued", value: String(counts.skills) },
    { label: "Certifications", value: String(counts.certifications) },
    { label: "Repositories Synced", value: String(counts.repositories) },
    { label: "Districts Open", value: `${counts.districtsOpen}/${counts.districtsTotal}` },
  ];

  return (
    <section className="world-summary" aria-label="World summary">
      <dl className="world-summary__grid">
        {stats.map((stat) => (
          <div key={stat.label} className="world-summary__stat">
            <dd>{stat.value}</dd>
            <dt>{stat.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
