import "../components/FloatingCitadel/FloatingCitadel.css";
import { getDistrict, getGuardianForDistrict } from "../lib/world.js";
import { getCertificationsForDistrict } from "../lib/floating-citadel.js";
import { FloatingCitadelHeader } from "../components/FloatingCitadel/FloatingCitadelHeader.js";
import { CertificationVault } from "../components/FloatingCitadel/CertificationVault.js";

const DISTRICT_ID = "floating-citadel";

export function FloatingCitadel() {
  const district = getDistrict(DISTRICT_ID);

  // Defensive only — content always defines floating-citadel, and the
  // route itself is a literal "/valley/floating-citadel" registration
  // (see App.tsx), not a generic `:districtId` param.
  if (!district) return null;

  const guardian = getGuardianForDistrict(district.id);
  const certifications = getCertificationsForDistrict(district.id);

  return (
    <main className="floating-citadel">
      <FloatingCitadelHeader district={district} guardian={guardian} certificationCount={certifications.length} />
      <CertificationVault certifications={certifications} />
    </main>
  );
}
