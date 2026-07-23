import type { Certification } from "../../lib/world.js";
import { formatMonthYear } from "../../lib/format-date.js";

export interface CertificationGridProps {
  certifications: Certification[];
}

export function CertificationGrid({ certifications }: CertificationGridProps) {
  if (certifications.length === 0) return null;

  return (
    <section className="certification-grid" aria-labelledby="certification-grid-heading">
      <h2 id="certification-grid-heading" className="certification-grid__heading">
        Certifications
      </h2>
      <ul className="certification-grid__list">
        {certifications.map((certification) => (
          <li key={certification.id} className="certification-grid__card">
            <p className="certification-grid__name">{certification.name}</p>
            <p className="certification-grid__issuer">{certification.issuer}</p>
            {certification.dateEarned && (
              <p className="certification-grid__date">Earned {formatMonthYear(certification.dateEarned)}</p>
            )}
            {certification.credentialUrl && (
              <a
                className="certification-grid__link"
                href={certification.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View credential <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
