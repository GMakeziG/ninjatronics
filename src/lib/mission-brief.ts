// Derived "recruiter résumé" view over the compiled world. Nothing here is
// persisted or written back to content/ or data/world.json — it's a pure,
// computed projection over world.ts (the already-validated World shape) and
// git-forest.ts's already-computed featured-repository curation. Mission
// Brief invents no new data: profile/contact are read from the Profile
// domain (content/profile/profile.json, via world.ts's getProfile()); every
// other field is a direct passthrough of an existing world.ts collection or
// derived from a field that already exists on District (dataSources).
// Deliberately does NOT import worldGraph or world-graph.ts directly: every
// field this module needs is already reachable from world.ts directly
// (skills, quests, projects, certifications, districts) or transitively
// through git-forest.ts's getFeaturedTrees(), which is itself the thing
// that reads worldGraph. An unused direct worldGraph import would also fail
// this repo's noUnusedLocals check. Deliberately NOT re-exported from
// world.ts, for the same circular-import (TDZ) reasons documented in
// git-forest.ts's header.
//
// buildMissionBrief takes an optional profile override (default:
// getProfile(), the real compiled data) so it can be unit-verified against
// a fabricated Profile without ever writing into content/.

import { world, getProfile } from "./world.js";
import type { Certification, Profile, Project, Quest, Skill } from "./world.js";
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
  /** Normalized to always-array; the schema leaves `links` optional. */
  links: Array<{ label: string; url: string }>;
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

export function buildMissionBrief(profile: Profile | undefined = getProfile()): MissionBrief {
  return {
    generatedAt: world.meta.generatedAt,
    profile: profile
      ? { name: profile.name, title: profile.title, tagline: profile.tagline }
      : {},
    contact: profile
      ? {
          email: profile.email,
          linkedin: profile.linkedin,
          website: profile.website,
          location: profile.location,
          links: profile.links ?? [],
        }
      : { links: [] },
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
