// Derived "repositories as trees" view over the compiled world. Nothing here
// is persisted or written back to content/ or data/world.json — it's a pure,
// computed projection over worldGraph (itself a derived view over the
// already-validated World from world.ts). This module is the first
// *consumer* of the world data layer, not part of it: it reads the
// already-computed worldGraph rather than re-reading data/world.json or
// re-implementing the district/guardian-to-repository grouping
// world-graph.ts already does. Deliberately NOT re-exported from world.ts:
// it needs worldGraph's runtime value (not just its type), so a back-import
// from world.ts would create a real circular-import (TDZ) failure.
//
// Scope: every repository in the world becomes a tree, regardless of which
// district currently owns it. CLAUDE.md's World Rules state "Repositories
// become trees" unconditionally — not "repositories under git-forest become
// trees" — and the repository schema places no restriction on districtId
// beyond "must reference a real district." Today all 8 repositories happen
// to live under the git-forest district, so this module's output is
// identical to "just git-forest's repositories," but nothing here hardcodes
// that district id, so behavior stays correct without changes if content
// ever assigns a repository elsewhere.

import { worldGraph } from "./world.js";
import type { District, Guardian } from "./world.js";
import type { WorldGraph } from "./world-graph.js";

export interface RepositoryTree {
  id: string;
  treeName: string;
  githubRepository: string;
  story?: string;
  /** Normalized to always-array; the schema leaves `technologies` optional. */
  technologies: string[];
  /**
   * Mechanical, fully-derived proxy for "how much is here to show":
   * (1 if story present else 0) + technologies.length. NOT a curation flag —
   * no such flag exists in the schema today. Exists only to give
   * getFeaturedTrees a deterministic default until real curation data
   * (e.g. an explicit `featured` field) exists.
   */
  richness: number;
  district: Pick<District, "id" | "name" | "slug" | "status">;
  guardian?: Guardian;
}

export interface GitForest {
  trees: RepositoryTree[];
}

function buildGitForest(graph: WorldGraph): GitForest {
  const trees = graph.nodes
    .flatMap((node) =>
      node.repositories.map((repo): RepositoryTree => {
        const technologies = repo.technologies ?? [];
        return {
          id: repo.id,
          treeName: repo.treeName,
          githubRepository: repo.githubRepository,
          story: repo.story,
          technologies,
          richness: (repo.story ? 1 : 0) + technologies.length,
          district: { id: node.id, name: node.name, slug: node.slug, status: node.status },
          guardian: node.guardian,
        };
      }),
    )
    // worldGraph groups repositories by district, so a flatMap over nodes is
    // only globally id-ordered by coincidence today (all 8 repos share one
    // district). Sort explicitly so "sorted by id" holds once a second
    // district has repositories too.
    .sort((a, b) => a.id.localeCompare(b.id));
  return { trees };
}

const gitForest: GitForest = buildGitForest(worldGraph);
const treesById = new Map(gitForest.trees.map((tree) => [tree.id, tree]));

export function getGitForest(): GitForest {
  return gitForest;
}

export function getRepositoryTree(id: string): RepositoryTree | undefined {
  return treesById.get(id);
}

export function getFeaturedTrees(limit = 3): RepositoryTree[] {
  const safeLimit = Math.max(0, limit);
  return [...gitForest.trees]
    .sort((a, b) => b.richness - a.richness || a.id.localeCompare(b.id))
    .slice(0, safeLimit);
}

/** All trees belonging to one district — the per-district counterpart to
 * `getGitForest().trees`, for district pages that need only their own
 * repositories rather than the whole forest. */
export function getTreesForDistrict(districtId: string): RepositoryTree[] {
  return gitForest.trees.filter((tree) => tree.district.id === districtId);
}

/** Same richness-based selection as `getFeaturedTrees`, scoped to one
 * district — so a district page's "featured repository" is drawn from its
 * own repositories, not accidentally from the whole forest (today those
 * are identical since every repository lives under git-forest, but this
 * stays correct once that's no longer true). */
export function getFeaturedTreesForDistrict(districtId: string, limit = 1): RepositoryTree[] {
  const safeLimit = Math.max(0, limit);
  return getTreesForDistrict(districtId)
    .sort((a, b) => b.richness - a.richness || a.id.localeCompare(b.id))
    .slice(0, safeLimit);
}
