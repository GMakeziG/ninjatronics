import { Route, Routes } from "react-router-dom";
import { AppShell } from "./AppShell.js";
import { Gate } from "../pages/Gate.js";
import { Valley } from "../pages/Valley.js";
import { MissionBrief } from "../pages/MissionBrief.js";
import { GitForest } from "../pages/GitForest.js";
import { RepositoryArtifact } from "../pages/RepositoryArtifact.js";
import { FloatingCitadel } from "../pages/FloatingCitadel.js";
import { CertificationArtifact } from "../pages/CertificationArtifact.js";
import { NotFound } from "../pages/NotFound.js";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Gate />} />
        <Route path="valley" element={<Valley />} />
        <Route path="valley/git-forest" element={<GitForest />} />
        <Route path="valley/git-forest/:repositorySlug" element={<RepositoryArtifact />} />
        <Route path="valley/floating-citadel" element={<FloatingCitadel />} />
        <Route path="valley/floating-citadel/:certificationSlug" element={<CertificationArtifact />} />
        <Route path="brief" element={<MissionBrief />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
