import { NormalizeErrorImpl, normalizeRepo } from "./normalize.js";
import type { GitHubRepo, MergedRepository, NormalizeError, RepositoryOverride } from "./types.js";

export interface MergeResult {
  merged: MergedRepository[];
  skipped: string[];
  errors: NormalizeError[];
}

/**
 * Combines GitHub-derived defaults with hand-authored overrides. Override keys
 * win wholesale per-key (no deep merge of arrays/objects) — this is the
 * "manual metadata overrides GitHub defaults" rule. Required fields the
 * override doesn't supply (e.g. districtId) are simply left absent; the World
 * Compiler's existing schema validation will fail closed on that later, which
 * is intentional — this script never invents a value for them.
 */
export function buildMergedRepositories(
  repos: GitHubRepo[],
  overrides: Map<string, RepositoryOverride>,
): MergeResult {
  const merged: MergedRepository[] = [];
  const skipped: string[] = [];
  const errors: NormalizeError[] = [];
  const seenIds = new Set<string>();

  for (const repo of repos) {
    let defaults;
    try {
      defaults = normalizeRepo(repo);
    } catch (err) {
      if (err instanceof NormalizeErrorImpl) {
        errors.push({ repoFullName: repo.full_name, message: err.message });
        continue;
      }
      throw err;
    }

    if (seenIds.has(defaults.id)) {
      errors.push({
        repoFullName: repo.full_name,
        message: `Repository "${repo.full_name}" slugifies to id "${defaults.id}", which another repository in this run already produced — skipping`,
      });
      continue;
    }
    seenIds.add(defaults.id);

    const override = overrides.get(defaults.id);
    if (override?.skip === true) {
      skipped.push(defaults.id);
      continue;
    }

    const combined: MergedRepository = { ...defaults, ...override };
    delete combined.skip;
    merged.push(combined);
  }

  return { merged, skipped, errors };
}
