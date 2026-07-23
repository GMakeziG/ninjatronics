import { Link, useParams } from "react-router-dom";
import "../components/FloatingCitadel/FloatingCitadel.css";
import { getCertification, getDistrict, getDistrictPath, getSkill } from "../lib/world.js";
import { getCertificationsForDistrict, getCertificationArtifactPath } from "../lib/floating-citadel.js";
import { formatMonthYear } from "../lib/format-date.js";
import { NotFound } from "./NotFound.js";

export function CertificationArtifact() {
  const { certificationSlug } = useParams<{ certificationSlug: string }>();
  const certification = certificationSlug ? getCertification(certificationSlug) : undefined;

  if (!certification) {
    return <NotFound message={`No certification named "${certificationSlug}" was found in the Floating Citadel.`} />;
  }

  const district = certification.districtId ? getDistrict(certification.districtId) : undefined;
  const skills = (certification.skillIds ?? [])
    .map((skillId) => getSkill(skillId))
    .filter((skill): skill is NonNullable<typeof skill> => skill !== undefined);

  // Same district, id-sorted order (floating-citadel.ts's own sort) —
  // previous/next are derived from that real ordering, not decorative
  // filler. Only rendered when a real district (and therefore a real
  // sibling list) exists.
  const siblings = certification.districtId ? getCertificationsForDistrict(certification.districtId) : [];
  const index = siblings.findIndex((sibling) => sibling.id === certification.id);
  const previous = index > 0 ? siblings[index - 1] : undefined;
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : undefined;
  const previousPath = previous ? getCertificationArtifactPath(previous) : undefined;
  const nextPath = next ? getCertificationArtifactPath(next) : undefined;

  return (
    <main className="certification-artifact">
      {district && (
        <Link to={getDistrictPath(district)} className="certification-artifact__back-link">
          <span aria-hidden="true">←</span> Back to {district.name}
        </Link>
      )}

      <header className="certification-artifact__identity">
        <p className="certification-artifact__eyebrow">Credential Record</p>
        <h1 className="certification-artifact__name">{certification.name}</h1>

        <dl className="certification-artifact__meta">
          <div className="certification-artifact__meta-item">
            <dt>Issuer</dt>
            <dd>{certification.issuer}</dd>
          </div>
          {certification.dateEarned && (
            <div className="certification-artifact__meta-item">
              <dt>Earned</dt>
              <dd>{formatMonthYear(certification.dateEarned)}</dd>
            </div>
          )}
          {district && (
            <div className="certification-artifact__meta-item">
              <dt>District</dt>
              <dd>{district.name}</dd>
            </div>
          )}
        </dl>

        {certification.credentialUrl && (
          <a
            className="certification-artifact__link"
            href={certification.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Verified Credential <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </header>

      {skills.length > 0 && (
        <section className="certification-artifact__section" aria-labelledby="related-skills-heading">
          <h2 id="related-skills-heading" className="certification-artifact__section-heading">
            Related Skills
          </h2>
          <ul className="certification-card__skills">
            {skills.map((skill) => (
              <li key={skill.id}>{skill.name}</li>
            ))}
          </ul>
        </section>
      )}

      {(previousPath || nextPath) && (
        <nav className="certification-artifact__related" aria-label="Adjacent credentials">
          {previous && previousPath && (
            <Link to={previousPath} className="certification-artifact__related-link">
              <span aria-hidden="true">←</span> {previous.name}
            </Link>
          )}
          {next && nextPath && (
            <Link
              to={nextPath}
              className="certification-artifact__related-link certification-artifact__related-link--next"
            >
              {next.name} <span aria-hidden="true">→</span>
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
