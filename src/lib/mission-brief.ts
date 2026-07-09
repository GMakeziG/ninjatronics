// Derived "recruiter résumé" view over the compiled world. Nothing here is
// persisted or written back to content/ or data/world.json — it's a pure,
// computed projection over world.ts (the already-validated World shape) and
// git-forest.ts's already-computed featured-repository curation. Mission
// Brief invents no new data: every field is either a direct passthrough of
// an existing world.ts collection, a value derived from a field that
// already exists on District (dataSources), or a genuinely-empty
// placeholder for content that has no source yet (profile/contact — see
// note below). Deliberately does NOT import worldGraph or world-graph.ts
// directly: every field this module needs is already reachable from
// world.ts directly (skills, quests, projects, certifications, districts)
// or transitively through git-forest.ts's getFeaturedTrees(), which is
// itself the thing that reads worldGraph. An unused direct worldGraph
// import would also fail this repo's noUnusedLocals check. Deliberately
// NOT re-exported from world.ts, for the same circular-import (TDZ)
// reasons documented in git-forest.ts's header.
//
// profile/contact are typed but intentionally empty today: there is no
// content source for personal identity data anywhere in the repo (no
// `profile` entity type, nothing in package.json/README.md). Hand-filling
// them here would violate "never invent content." They stay {} until a
// future content/profile/profile.json + profile schema + registry entry
// exists — deliberately out of scope for this module.

import { world } from "./world.js";
import type { Certification, Project, Quest, Skill } from "./world.js";
import { getFeaturedTrees } from "./git-forest.js";
import type { RepositoryTree } from "./git-forest.js";

export interface MissionBriefProfile {
  name?: string;
  title?: string;
  tagline?: string;
}

export interface MissionBriefContact {
  email?: string;
  linkedin?: string;
  website?: string;
  location?: string;
}

export interface MissionBrief {
  /** Carried verbatim from world.meta.generatedAt — when the underlying
   * content was last compiled, not when this brief happens to be read. */
  generatedAt: string;
  profile: MissionBriefProfile;
  contact: MissionBriefContact;
  githubUrl?: string;
  skills: Skill[];
  learningPaths: Quest[];
  featuredRepositories: RepositoryTree[];
  projects: Project[];
  certifications: Certification[];
}

/**
 * First "github" dataSource with a non-empty owner, scanning districts in
 * their compiled (id-sorted, per assemble.ts) order — the same ordering
 * guarantee world-graph.ts already relies on for its node list. Returns
 * undefined if no district declares one, or if the only ones declared omit
 * `owner` (the schema allows a github dataSource with no owner).
 */
function deriveGithubUrl(): string | undefined {
  for (const district of world.districts) {
    for (const source of district.dataSources ?? []) {
      if (source.type === "github" && source.owner) {
        return `https://github.com/${source.owner}`;
      }
    }
  }
  return undefined;
}

function buildMissionBrief(): MissionBrief {
  return {
    generatedAt: world.meta.generatedAt,
    profile: {},
    contact: {},
    githubUrl: deriveGithubUrl(),
    skills: world.skills,
    learningPaths: world.quests,
    featuredRepositories: getFeaturedTrees(),
    projects: world.projects,
    certifications: world.certifications,
  };
}

const missionBrief: MissionBrief = buildMissionBrief();

export function getMissionBrief(): MissionBrief {
  return missionBrief;
}
