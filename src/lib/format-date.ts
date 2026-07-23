// Tiny shared formatter — avoids duplicating date-parsing logic across
// ExperienceTimeline and CertificationGrid. Appends a midnight time so the
// bare `YYYY-MM-DD` dates in content aren't shifted a day by timezone
// parsing (a bare date string parses as UTC midnight).

export function formatMonthYear(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
