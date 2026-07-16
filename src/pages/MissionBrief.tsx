import { getMissionBrief } from "../lib/mission-brief.js";

export function MissionBrief() {
  const brief = getMissionBrief();

  return (
    <main>
      <h1>Mission Brief</h1>
      <p>
        {brief.profile.name} — {brief.profile.title}
      </p>
      <section>
        <h2>Skills</h2>
        <ul>
          {brief.skills.map((skill) => (
            <li key={skill.id}>{skill.name}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Certifications</h2>
        <ul>
          {brief.certifications.map((certification) => (
            <li key={certification.id}>
              {certification.name} — {certification.issuer}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Work History</h2>
        <ul>
          {brief.workHistory.map((experience) => (
            <li key={experience.id}>
              {experience.role} at {experience.employer}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
