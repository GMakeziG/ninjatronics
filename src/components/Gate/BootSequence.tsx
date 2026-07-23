import { useEffect, useRef, useState } from "react";
import "./BootSequence.css";
import { useTheme } from "../../app/theme/ThemeProvider.js";

const SESSION_KEY = "ninjatronics:boot-complete";
// Within Motion Specification.md's documented 150-200ms stagger range.
const LINE_STAGGER_MS = 160;
// Mirrors the per-line reveal animation's duration in BootSequence.css
// (--duration-overlay) — used to size the auto-advance timeout.
const LINE_REVEAL_MS = 300;

export interface BootSequenceProps {
  lines: string[];
  onReady: () => void;
}

/**
 * Plays once per browser session (State Diagrams.md: "skip" variant on
 * return visits). All lines are always in the DOM from mount — only their
 * visual reveal is staggered — so screen reader and reduced-motion users
 * get the complete content immediately regardless of animation state.
 */
export function BootSequence({ lines, onReady }: BootSequenceProps) {
  const { reducedMotion } = useTheme();
  const alreadyPlayed = typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "true";
  const [instant, setInstant] = useState(reducedMotion || alreadyPlayed);
  const readyFired = useRef(false);

  useEffect(() => {
    const finish = () => {
      if (readyFired.current) return;
      readyFired.current = true;
      sessionStorage.setItem(SESSION_KEY, "true");
      onReady();
    };

    if (reducedMotion || alreadyPlayed) {
      finish();
      return;
    }

    const totalDuration = lines.length * LINE_STAGGER_MS + LINE_REVEAL_MS;
    const timeout = window.setTimeout(finish, totalDuration);

    const interrupt = () => {
      setInstant(true);
      window.clearTimeout(timeout);
      finish();
    };

    window.addEventListener("keydown", interrupt);
    window.addEventListener("click", interrupt);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("keydown", interrupt);
      window.removeEventListener("click", interrupt);
    };
    // Intentionally mount-only: the boot variant (full vs. skip) is decided
    // once, per State Diagrams.md's BootSequence machine — it does not
    // react to later prop/state changes.
  }, []);

  return (
    <div className={`boot-sequence${instant ? " boot-sequence--instant" : ""}`}>
      {lines.map((line, index) => (
        <p key={line} className="boot-sequence__line" style={{ animationDelay: `${index * LINE_STAGGER_MS}ms` }}>
          {line}
        </p>
      ))}
    </div>
  );
}
