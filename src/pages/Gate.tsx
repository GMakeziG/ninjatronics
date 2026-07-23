import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import "./Gate.css";
import { useTheme } from "../app/theme/ThemeProvider.js";
import type { AppShellOutletContext } from "../app/AppShell.js";
import { GateHero } from "../components/Gate/GateHero.js";
import { BootSequence } from "../components/Gate/BootSequence.js";
import { EnterButton } from "../components/Gate/EnterButton.js";
import { world, getProfile } from "../lib/world.js";

const ENTER_TRANSITION_MS = 300;

function buildBootLines(): string[] {
  const districtsOpen = world.districts.filter((district) => district.status === "open").length;
  const districtsTotal = world.districts.length;

  const earliestStart = world.experiences.reduce<string | undefined>(
    (earliest, experience) => (!earliest || experience.startDate < earliest ? experience.startDate : earliest),
    undefined,
  );
  const yearsActive = earliestStart
    ? Math.floor((Date.now() - new Date(earliestStart).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : undefined;

  const lines = [
    "SYSTEM ONLINE",
    `${districtsOpen}/${districtsTotal} DISTRICTS OPEN`,
    `${world.repositories.length} REPOSITORIES SYNCED`,
    `${world.skills.length} SKILLS CATALOGUED`,
    `${world.certifications.length} CERTIFICATIONS VERIFIED`,
  ];

  if (typeof yearsActive === "number") {
    lines.push(`${yearsActive}+ YEARS FIELD EXPERIENCE`);
  }

  return lines;
}

export function Gate() {
  const navigate = useNavigate();
  const { onOpenTerminal, onOpenShortcutHelp } = useOutletContext<AppShellOutletContext>();
  const { reducedMotion } = useTheme();
  const profile = getProfile();
  const [bootReady, setBootReady] = useState(false);
  const [entering, setEntering] = useState(false);
  const bootLines = buildBootLines();

  const handleEnter = () => {
    if (entering) return;

    if (reducedMotion) {
      navigate("/valley");
      return;
    }

    setEntering(true);
    window.setTimeout(() => navigate("/valley"), ENTER_TRANSITION_MS);
  };

  return (
    <main className={`gate${entering ? " gate--entering" : ""}`}>
      <GateHero tagline={profile?.tagline} glitchActive={!reducedMotion && !bootReady} />
      <BootSequence lines={bootLines} onReady={() => setBootReady(true)} />
      <div className="gate__cta">
        <EnterButton ready={bootReady} onEnter={handleEnter} />

        {bootReady && (
          <p className="gate__hint">
            Press <kbd>`</kbd>{" "}
            <button type="button" className="gate__hint-action" onClick={onOpenTerminal} aria-label="Open Terminal">
              for Terminal
            </button>
            {" · "}
            <kbd>?</kbd>{" "}
            <button
              type="button"
              className="gate__hint-action"
              onClick={onOpenShortcutHelp}
              aria-label="Open keyboard shortcuts help"
            >
              for shortcuts
            </button>
          </p>
        )}
      </div>
    </main>
  );
}
