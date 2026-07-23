import { Link } from "react-router-dom";
import { getDistrictPath, type Certification, type District } from "../../lib/world.js";

export interface CertificationSummaryProps {
  certifications: Certification[];
  /** Floating Citadel, when it exists — the link only renders once it's
   * real and actually open (never a dead link to an unopened district). */
  district?: District;
}

/**
 * Compact credential summary — names only, no issuer/date/link metadata.
 * Floating Citadel (once open) is the authoritative place for full
 * certification detail; this section exists to orient a recruiter and
 * hand off, not to duplicate what that district already shows.
 */
export function CertificationSummary({ certifications, district }: CertificationSummaryProps) {
  if (certifications.length === 0) return null;

  return (
    <section className="certification-summary" aria-labelledby="certification-summary-heading">
      <h2 id="certification-summary-heading" className="certification-summary__heading">
        Certifications
      </h2>
      <ul className="certification-summary__list">
        {certifications.map((certification) => (
          <li key={certification.id}>{certification.name}</li>
        ))}
      </ul>

      {district?.status === "open" && (
        <Link to={getDistrictPath(district)} className="certification-summary__link">
          View all credentials in {district.name} <span aria-hidden="true">→</span>
        </Link>
      )}
    </section>
  );
}
