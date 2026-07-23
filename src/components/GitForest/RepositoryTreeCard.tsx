import { useState } from "react";
import type { RepositoryTree } from "../../lib/git-forest.js";

export interface RepositoryTreeCardProps {
  tree: RepositoryTree;
  featured?: boolean;
}

/**
 * The "lore" name (treeName) and the real GitHub repo name only differ for
 * a couple of repositories today (e.g. "The Ancient Oak" / "lab") — this
 * compares against the actual data rather than assuming they're always
 * different, so a repo whose lore name matches its real name doesn't get
 * a redundant second label.
 */
function realRepoName(githubRepository: string): string {
  const [, repo] = githubRepository.split("/");
  return repo ?? githubRepository;
}

export function RepositoryTreeCard({ tree, featured = false }: RepositoryTreeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const repoName = realRepoName(tree.githubRepository);
  const showRealName = repoName !== tree.treeName;
  const hasDetail = !!tree.story || tree.technologies.length > 0;
  const detailId = `repo-detail-${tree.id}`;

  return (
    <article className={`repo-tree-card${featured ? " repo-tree-card--featured" : ""}`}>
      <div className="repo-tree-card__header">
        <h3 className="repo-tree-card__name">{tree.treeName}</h3>
        {featured && <span className="repo-tree-card__badge">Featured</span>}
      </div>

      {showRealName && <p className="repo-tree-card__repo-name">{repoName}</p>}

      <a
        className="repo-tree-card__link"
        href={`https://github.com/${tree.githubRepository}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        View on GitHub <span aria-hidden="true">↗</span>
        <span className="sr-only"> (opens in a new tab)</span>
      </a>

      {hasDetail && (
        <>
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
        </>
      )}
    </article>
  );
}
