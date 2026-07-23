import { Link } from "react-router-dom";
import "../components/MissionBrief/MissionBrief.css";
import { getMissionBrief } from "../lib/mission-brief.js";
import { getGitForest } from "../lib/git-forest.js";
import { getSkill, listDistricts } from "../lib/world.js";
import { MissionHeader } from "../components/MissionBrief/MissionHeader.js";
import { WorldSummary } from "../components/MissionBrief/WorldSummary.js";
import { CurrentMission } from "../components/MissionBrief/CurrentMission.js";
import { ExperienceTimeline } from "../components/MissionBrief/ExperienceTimeline.js";
import { SkillsOverview } from "../components/MissionBrief/SkillsOverview.js";
// Certification ownership: Mission Brief is the recruiter-facing credential
// summary today. Floating Citadel (content/districts/floating-citadel.json)
// is the intended long-term authoritative certification district — once it
// has a real page, reduce CertificationGrid here to a compact summary that
// links out to it, the same handoff pattern ExploreWorld now uses for
// Git Forest/repositories. Not done in this milestone: Floating Citadel
// isn't built yet, so there's nowhere real to hand off to.
import { CertificationGrid } from "../components/MissionBrief/CertificationGrid.js";
import { ExploreWorld } from "../components/MissionBrief/ExploreWorld.js";

export function MissionBrief() {
  const brief = getMissionBrief();
  const districts = listDistricts();
  const districtsOpen = districts.filter((district) => district.status === "open").length;

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

      <CertificationGrid certifications={brief.certifications} />

      <ExploreWorld districts={districts} />
    </main>
  );
}
