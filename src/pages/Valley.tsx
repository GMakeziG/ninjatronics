import "./Valley.css";
import { listDistricts, getGuardianForDistrict, getRepositoriesForDistrict, world } from "../lib/world.js";
import { DistrictCard } from "../components/DistrictCard/DistrictCard.js";

export function Valley() {
  const districts = listDistricts();
  const districtsOpen = districts.filter((district) => district.status === "open").length;

  return (
    <main className="valley">
      <header className="valley__hero">
        <p className="valley__eyebrow">The Valley</p>
        <h1 className="valley__title">Explore the World</h1>
        <p className="valley__lede">
          {districtsOpen} of {districts.length} districts open · {world.repositories.length} repositories tracked
        </p>
      </header>

      <div className="valley__grid">
        {districts.map((district) => (
          <DistrictCard
            key={district.id}
            district={district}
            guardian={getGuardianForDistrict(district.id)}
            connectionCount={district.connections?.length ?? 0}
            repositoryCount={getRepositoriesForDistrict(district.id).length}
          />
        ))}
      </div>
    </main>
  );
}
