import "../components/GitForest/GitForest.css";
import { getDistrict, getGuardianForDistrict } from "../lib/world.js";
import { getTreesForDistrict, getFeaturedTreesForDistrict } from "../lib/git-forest.js";
import { GitForestHeader } from "../components/GitForest/GitForestHeader.js";
import { RepositoryCanopy } from "../components/GitForest/RepositoryCanopy.js";

const DISTRICT_ID = "git-forest";

export function GitForest() {
  const district = getDistrict(DISTRICT_ID);

  // Defensive only — content always defines git-forest, and the route
  // itself is a literal "/valley/git-forest" registration (see App.tsx),
  // not a generic `:districtId` param, so no other id can ever land here.
  if (!district) return null;

  const guardian = getGuardianForDistrict(district.id);
  const trees = getTreesForDistrict(district.id);
  const featured = getFeaturedTreesForDistrict(district.id, 1)[0];

  return (
    <main className="git-forest">
      <GitForestHeader district={district} guardian={guardian} repositoryCount={trees.length} />
      <RepositoryCanopy trees={trees} featured={featured} />
    </main>
  );
}
