import { Link } from "react-router-dom";
import { getCertificationArtifactPath } from "../../lib/floating-citadel.js";
import { getSkill, type Certification } from "../../lib/world.js";
import { formatMonthYear } from "../../lib/format-date.js";

export interface CertificationCardProps {
  certification: Certification;
}

export function CertificationCard({ certification }: CertificationCardProps) {
  const artifactPath = getCertificationArtifactPath(certification);
  const skills = (certification.skillIds ?? [])
    .map((skillId) => getSkill(skillId))
    .filter((skill): skill is NonNullable<typeof skill> => skill !== undefined);

  return (
    <article className="certification-card">
      <h3 className="certification-card__name">
        {artifactPath ? <Link to={artifactPath}>{certification.name}</Link> : certification.name}
      </h3>
      <p className="certification-card__issuer">{certification.issuer}</p>

      {certification.dateEarned && (
        <p className="certification-card__date">Earned {formatMonthYear(certification.dateEarned)}</p>
      )}

      {certification.credentialUrl && (
        <a
          className="certification-card__link"
          href={certification.credentialUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Verified Credential <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}

      {skills.length > 0 && (
        <ul className="certification-card__skills">
          {skills.map((skill) => (
            <li key={skill.id}>{skill.name}</li>
          ))}
        </ul>
      )}
    </article>
  );
}
