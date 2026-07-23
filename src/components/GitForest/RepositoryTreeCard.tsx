import { useState } from "react";
import { Link } from "react-router-dom";
import { getRepositoryArtifactPath, type RepositoryTree } from "../../lib/git-forest.js";

export interface RepositoryTreeCardProps {
  tree: RepositoryTree;
  featured?: boolean;
}

export function RepositoryTreeCard({ tree, featured = false }: RepositoryTreeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasDetail = !!tree.story || tree.technologies.length > 0;
  const detailId = `repo-detail-${tree.id}`;

  return (
    <article className={`repo-tree-card${featured ? " repo-tree-card--featured" : ""}`}>
      <div className="repo-tree-card__primary">
        <div className="repo-tree-card__header">
          <h3 className="repo-tree-card__name">
            <Link to={getRepositoryArtifactPath(tree)} className="repo-tree-card__name-link">
              {tree.treeName}
            </Link>
          </h3>
          {featured && <span className="repo-tree-card__badge">Featured</span>}
        </div>

        {/* Owner is real data not shown anywhere else on the card, so this
            renders unconditionally rather than only when the lore name
            differs from the repo name — it's never purely redundant. */}
        <p className="repo-tree-card__repo-name">
          Repository: <span className="repo-tree-card__repo-slug">{tree.githubRepository}</span>
        </p>

        <a
          className="repo-tree-card__link"
          href={`https://github.com/${tree.githubRepository}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>

      {hasDetail && (
        <div className="repo-tree-card__secondary">
          <button
            type="button"
            className="repo-tree-card__toggle"
            aria-expanded={expanded}
            aria-controls={detailId}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "Hide details" : "Show details"}
          </button>

          <div id={detailId} className="repo-tree-card__detail" hidden={!expanded}>
            {tree.story && <p className="repo-tree-card__story">{tree.story}</p>}
            {tree.technologies.length > 0 && (
              <ul className="repo-tree-card__tech">
                {tree.technologies.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
