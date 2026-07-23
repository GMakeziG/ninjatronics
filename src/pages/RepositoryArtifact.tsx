import { Link, useParams } from "react-router-dom";
import "../components/GitForest/GitForest.css";
import { getRepositoryTree, getTreesForDistrict, getRepositoryArtifactPath } from "../lib/git-forest.js";
import { getDistrictPath } from "../lib/world.js";
import { NotFound } from "./NotFound.js";

export function RepositoryArtifact() {
  const { repositorySlug } = useParams<{ repositorySlug: string }>();
  const tree = repositorySlug ? getRepositoryTree(repositorySlug) : undefined;

  if (!tree) {
    return <NotFound message={`No repository named "${repositorySlug}" was found in the Git Forest.`} />;
  }

  // Same district, id-sorted order (git-forest.ts's own sort) — previous/
  // next are derived from that real ordering, not decorative filler.
  const siblings = getTreesForDistrict(tree.district.id);
  const index = siblings.findIndex((sibling) => sibling.id === tree.id);
  const previous = index > 0 ? siblings[index - 1] : undefined;
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : undefined;

  return (
    <main className="repository-artifact">
      <Link to={getDistrictPath(tree.district)} className="git-forest__back-link">
        <span aria-hidden="true">←</span> Back to {tree.district.name}
      </Link>

      <header className="repository-artifact__identity">
        <h1 className="repository-artifact__name">{tree.treeName}</h1>

        <dl className="repo-tree-card__meta">
          <div className="repo-tree-card__meta-item">
            <dt>Repository</dt>
            <dd>{tree.githubRepository}</dd>
          </div>
          <div className="repo-tree-card__meta-item">
            <dt>District</dt>
            <dd>{tree.district.name}</dd>
          </div>
        </dl>

        <a
          className="repository-artifact__github-link"
          href={`https://github.com/${tree.githubRepository}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </header>

      {tree.story && (
        <section className="repository-artifact__section" aria-labelledby="repository-story-heading">
          <h2 id="repository-story-heading" className="repository-artifact__section-heading">
            Field Notes
          </h2>
          <p className="repository-artifact__story">{tree.story}</p>
        </section>
      )}

      {tree.technologies.length > 0 && (
        <section className="repository-artifact__section" aria-labelledby="technical-profile-heading">
          <h2 id="technical-profile-heading" className="repository-artifact__section-heading">
            Observed Technologies
          </h2>
          <ul className="repo-tree-card__tech">
            {tree.technologies.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        </section>
      )}

      <nav className="repository-artifact__related" aria-label="Adjacent trees">
        {previous && (
          <Link to={getRepositoryArtifactPath(previous)} className="repository-artifact__related-link">
            <span aria-hidden="true">←</span> {previous.treeName}
          </Link>
        )}
        {next && (
          <Link
            to={getRepositoryArtifactPath(next)}
            className="repository-artifact__related-link repository-artifact__related-link--next"
          >
            {next.treeName} <span aria-hidden="true">→</span>
          </Link>
        )}
      </nav>
    </main>
  );
}
