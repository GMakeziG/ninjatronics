import { CertificationCard } from "./CertificationCard.js";
import type { Certification } from "../../lib/world.js";

export interface CertificationVaultProps {
  certifications: Certification[];
}

export function CertificationVault({ certifications }: CertificationVaultProps) {
  return (
    <section className="certification-vault" aria-labelledby="certification-vault-heading">
      <h2 id="certification-vault-heading" className="certification-vault__heading">
        Credential Vault
      </h2>

      {certifications.length > 0 ? (
        <div className="certification-vault__grid">
          {certifications.map((certification) => (
            <CertificationCard key={certification.id} certification={certification} />
          ))}
        </div>
      ) : (
        <p className="certification-vault__empty">No certifications recorded yet.</p>
      )}
    </section>
  );
}
