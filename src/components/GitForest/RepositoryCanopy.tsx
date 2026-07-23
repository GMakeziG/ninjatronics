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

  // The featured tree gets its own section above — excluded here by id so
  // it never renders twice. Featured (0 or 1) + supportingTrees always add
  // back up to the district's full repository count.
  const supportingTrees = featured ? trees.filter((tree) => tree.id !== featured.id) : trees;

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
        {supportingTrees.length > 0 ? (
          <div className="repository-canopy__grid">
            {supportingTrees.map((tree) => (
              <RepositoryTreeCard key={tree.id} tree={tree} />
            ))}
          </div>
        ) : (
          <p className="repository-canopy__empty">The featured repository above is the only one synced so far.</p>
        )}
      </section>
    </>
  );
}
