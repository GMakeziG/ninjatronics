import { RepositoryTreeCard } from "./RepositoryTreeCard.js";
import type { RepositoryTree } from "../../lib/git-forest.js";

export interface RepositoryCanopyProps {
  trees: RepositoryTree[];
  featured?: RepositoryTree;
}

export function RepositoryCanopy({ trees, featured }: RepositoryCanopyProps) {
  if (trees.length === 0) {
    return (
      <section className="repository-canopy" aria-labelledby="repository-canopy-heading">
        <h2 id="repository-canopy-heading" className="repository-canopy__heading">
          Repository Canopy
        </h2>
        <p className="repository-canopy__empty">No repositories synced yet.</p>
      </section>
    );
  }

  return (
    <>
      {featured && (
        <section className="repository-canopy__featured" aria-labelledby="featured-repository-heading">
          <h2 id="featured-repository-heading" className="repository-canopy__heading">
            Featured Repository
          </h2>
          <RepositoryTreeCard tree={featured} featured />
        </section>
      )}

      <section className="repository-canopy" aria-labelledby="repository-canopy-heading">
        <h2 id="repository-canopy-heading" className="repository-canopy__heading">
          Repository Canopy
        </h2>
        <div className="repository-canopy__grid">
          {trees.map((tree) => (
            <RepositoryTreeCard key={tree.id} tree={tree} featured={tree.id === featured?.id} />
          ))}
        </div>
      </section>
    </>
  );
}
