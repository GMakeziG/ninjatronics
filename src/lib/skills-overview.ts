// Small pure read-model helper, not part of mission-brief.ts's existing
// documented scope: groups an already-resolved Skill[] (e.g. from
// getMissionBrief().skills) by their existing `category` field. Takes data
// in as a parameter rather than reading world.ts itself, so it stays a
// reusable transform any future consumer (Mission Brief today, a future
// district skill panel, etc.) can call with whatever Skill[] it already has.

import type { Skill } from "./world.js";

export interface SkillCategoryGroup {
  category: string;
  skills: Skill[];
}

const UNCATEGORIZED = "Uncategorized";

/**
 * Categories and the skills within each are sorted alphabetically for
 * stable, scannable output — not by count, recency, or any invented
 * ranking. `category` is optional in the schema; skills without one are
 * grouped under "Uncategorized" rather than silently dropped.
 */
export function groupSkillsByCategory(skills: Skill[]): SkillCategoryGroup[] {
  const groups = new Map<string, Skill[]>();

  for (const skill of skills) {
    const category = skill.category ?? UNCATEGORIZED;
    const bucket = groups.get(category);
    if (bucket) {
      bucket.push(skill);
    } else {
      groups.set(category, [skill]);
    }
  }

  return [...groups.entries()]
    .map(([category, categorySkills]) => ({
      category,
      skills: [...categorySkills].sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.category.localeCompare(b.category));
}
