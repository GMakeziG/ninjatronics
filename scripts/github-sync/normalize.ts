import type { GitHubRepo, RepositoryDefaults } from "./types.js";

export class NormalizeErrorImpl extends Error {}

/** Lowercase, collapse any run of non [a-z0-9] characters to a single "-", trim edges. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Maps a raw GitHub repo to the subset of repository-entity fields derivable from
 * GitHub alone. Fields with nothing meaningful to say (empty description, no
 * topics/language) are omitted entirely rather than written as null/empty, so a
 * later override always has something clean to layer on top of.
 */
export function normalizeRepo(repo: GitHubRepo): RepositoryDefaults {
  const id = slugify(repo.name);
  if (!id) {
    throw new NormalizeErrorImpl(
      `Cannot derive a valid id from repository name "${repo.name}" (${repo.full_name})`,
    );
  }

  const story = repo.description?.trim() ? { story: repo.description.trim() } : {};
  const technologies = repo.topics.length
    ? { technologies: [...repo.topics] }
    : repo.language
      ? { technologies: [repo.language] }
      : {};

  return {
    id,
    githubRepository: repo.full_name,
    treeName: repo.name,
    ...story,
    ...technologies,
  };
}
