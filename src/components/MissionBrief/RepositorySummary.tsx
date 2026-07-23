import type { RepositoryTree } from "../../lib/git-forest.js";

export interface RepositorySummaryProps {
  featuredTrees: RepositoryTree[];
  totalCount: number;
  githubUrl?: string;
}

export function RepositorySummary({ featuredTrees, totalCount, githubUrl }: RepositorySummaryProps) {
  if (totalCount === 0) return null;

  return (
    <section className="repository-summary" aria-labelledby="repository-summary-heading">
      <div className="repository-summary__header">
        <h2 id="repository-summary-heading" className="repository-summary__heading">
          Repositories
        </h2>
        <p className="repository-summary__count">
          {totalCount} repositories synced from GitHub
          {featuredTrees.length < totalCount && ` · showing ${featuredTrees.length}`}
        </p>
      </div>

      <ul className="repository-summary__list">
        {featuredTrees.map((tree) => (
          <li key={tree.id} className="repository-summary__card">
            <p className="repository-summary__tree-name">{tree.treeName}</p>
            {tree.story && <p className="repository-summary__story">{tree.story}</p>}
            {tree.technologies.length > 0 && (
              <ul className="repository-summary__tech">
                {tree.technologies.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            )}
            <a
              className="repository-summary__link"
              href={`https://github.com/${tree.githubRepository}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub <span aria-hidden="true">↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>

      {githubUrl && (
        <a className="repository-summary__all-link" href={githubUrl} target="_blank" rel="noopener noreferrer">
          See all repositories on GitHub <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
    </section>
  );
}
