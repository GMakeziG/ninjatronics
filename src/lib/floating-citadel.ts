// Small read-model helper for the Floating Citadel district — the
// certification counterpart to git-forest.ts's repository helpers.
// Certifications are already a flat collection on world.ts with a real
// `districtId`, so unlike git-forest.ts this needs no worldGraph traversal
// — it's a plain filter + a stable sort.

import { world, getDistrict } from "./world.js";
import type { Certification } from "./world.js";

/** All certifications belonging to one district, sorted by id for a
 * stable, deterministic display/adjacent-navigation order. */
export function getCertificationsForDistrict(districtId: string): Certification[] {
  return world.certifications
    .filter((certification) => certification.districtId === districtId)
    .sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * The single place a certification artifact URL is built — both the UI
 * (CertificationCard's link) and the Terminal (`cert`/`open <cert>`) call
 * this rather than each constructing "/valley/.../..." themselves.
 * Returns undefined (no link renders) if the certification has no real
 * district to nest its route under — never falls back to a guessed path.
 */
export function getCertificationArtifactPath(certification: Certification): string | undefined {
  if (!certification.districtId) return undefined;
  const district = getDistrict(certification.districtId);
  if (!district) return undefined;
  return `/valley/${district.slug}/${certification.id}`;
}
