import { groupSkillsByCategory } from "../../lib/skills-overview.js";
import type { Skill } from "../../lib/world.js";

export interface SkillsOverviewProps {
  skills: Skill[];
}

export function SkillsOverview({ skills }: SkillsOverviewProps) {
  if (skills.length === 0) return null;

  const groups = groupSkillsByCategory(skills);

  return (
    <section className="skills-overview" aria-labelledby="skills-overview-heading">
      <h2 id="skills-overview-heading" className="skills-overview__heading">
        Specialization Areas
      </h2>
      <div className="skills-overview__grid">
        {groups.map((group) => (
          <div key={group.category} className="skills-overview__category">
            <p className="skills-overview__category-name">
              {group.category} <span className="skills-overview__category-count">{group.skills.length}</span>
            </p>
            <ul className="skills-overview__chips">
              {group.skills.map((skill) => (
                <li key={skill.id}>{skill.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
