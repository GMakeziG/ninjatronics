// Shared types for the GitHub repository ingestion service.

export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  fork: boolean;
  archived: boolean;
  language: string | null;
  topics: string[];
}

/** Fields derivable from a GitHub repo alone, before any manual override is applied. */
export interface RepositoryDefaults {
  id: string;
  githubRepository: string;
  treeName: string;
  story?: string;
  technologies?: string[];
}

/**
 * A hand-authored partial patch under content-overrides/repositories/<id>.json.
 * Not schema-validated — intentionally incomplete, unlike a full repository entity.
 */
export interface RepositoryOverride {
  districtId?: string;
  treeName?: string;
  story?: string;
  technologies?: string[];
  skillIds?: string[];
  skip?: boolean;
  [key: string]: unknown;
}

/** A defaults+override merge result. May still be missing required entity fields (e.g. districtId). */
export type MergedRepository = Record<string, unknown> & { id: string };

export interface NormalizeError {
  repoFullName: string;
  message: string;
}
