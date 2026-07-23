import { Link } from "react-router-dom";
import "../components/MissionBrief/MissionBrief.css";
import { getMissionBrief } from "../lib/mission-brief.js";
import { getGitForest } from "../lib/git-forest.js";
import { getSkill, listDistricts, getDistrict } from "../lib/world.js";
import { MissionHeader } from "../components/MissionBrief/MissionHeader.js";
import { WorldSummary } from "../components/MissionBrief/WorldSummary.js";
import { CurrentMission } from "../components/MissionBrief/CurrentMission.js";
import { ExperienceTimeline } from "../components/MissionBrief/ExperienceTimeline.js";
import { SkillsOverview } from "../components/MissionBrief/SkillsOverview.js";
// Certification ownership: Floating Citadel (content/districts/
// floating-citadel.json) is now the authoritative certification district.
// CertificationSummary here is deliberately compact (names only) and hands
// off to it — the same pattern ExploreWorld already uses for Git Forest.
import { CertificationSummary } from "../components/MissionBrief/CertificationSummary.js";
import { ExploreWorld } from "../components/MissionBrief/ExploreWorld.js";

export function MissionBrief() {
  const brief = getMissionBrief();
  const districts = listDistricts();
  const districtsOpen = districts.filter((district) => district.status === "open").length;
  const floatingCitadel = getDistrict("floating-citadel");

  const currentExperience = brief.workHistory.find((experience) => experience.current);
  const currentSkills = (currentExperience?.skillIds ?? [])
    .map((skillId) => getSkill(skillId))
    .filter((skill): skill is NonNullable<typeof skill> => skill !== undefined);

  return (
    <main className="mission-brief">
      <Link to="/valley" className="mission-brief__back-link">
        <span aria-hidden="true">←</span> Back to the Valley
      </Link>

      <MissionHeader profile={brief.profile} contact={brief.contact} githubUrl={brief.githubUrl} />

      <WorldSummary
        counts={{
          experiences: brief.workHistory.length,
          skills: brief.skills.length,
          certifications: brief.certifications.length,
          repositories: getGitForest().trees.length,
          districtsOpen,
          districtsTotal: districts.length,
        }}
      />

      <CurrentMission experience={currentExperience} skills={currentSkills} />

      <ExperienceTimeline experiences={brief.workHistory} />

      <SkillsOverview skills={brief.skills} />

      <CertificationSummary certifications={brief.certifications} district={floatingCitadel} />

      <ExploreWorld districts={districts} />
    </main>
  );
}
