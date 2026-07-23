import { useEffect, useRef, useState } from "react";
import "./BootSequence.css";
import { useTheme } from "../../app/theme/ThemeProvider.js";

// A deliberate system-initialization pace, not an instant content reveal —
// targets a total sequence length of roughly 3-4s end to end (see the
// totalDuration calculation below). Stagger sits within Motion
// Specification.md's documented "sequential line reveal" range, at its
// slower end on purpose.
const LINE_STAGGER_MS = 420;
// Mirrors the per-line reveal animation's duration in BootSequence.css.
const LINE_REVEAL_MS = 550;
// A brief, deliberate stillness after the last line settles and before the
// CTA activates — "controlled instability, then stillness," not an abrupt
// cut from last-line-done straight to interactive.
const SETTLE_HOLD_MS = 500;

export interface BootSequenceProps {
  lines: string[];
  onReady: () => void;
}

/**
 * Plays once per mount, every time the Gate route is entered — no
 * persisted "already seen this session" skip (deliberately removed; the
 * boot must be observable on every visit). All lines are always in the
 * DOM from mount — only their visual reveal is staggered — so screen
 * reader and reduced-motion users get the complete content immediately
 * regardless of animation state.
 */
export function BootSequence({ lines, onReady }: BootSequenceProps) {
  const { reducedMotion } = useTheme();
  const [instant, setInstant] = useState(reducedMotion);
  const readyFired = useRef(false);

  useEffect(() => {
    if (reducedMotion) {
      if (!readyFired.current) {
        readyFired.current = true;
        onReady();
      }
      return;
    }

    const totalDuration = lines.length * LINE_STAGGER_MS + LINE_REVEAL_MS + SETTLE_HOLD_MS;
    let timeout: number;

    // Any key/click while booting completes it immediately — and must be
    // the *only* thing that key does. Listening on the capture phase and
    // calling stopPropagation() here means this handler runs and consumes
    // the event before it ever reaches the bubble-phase global shortcut
    // listener mounted in AppShell, so the same keypress can't also arm
    // `g`, toggle the shortcut-help overlay, or navigate.
    //
    // Bug fixed here: these listeners MUST be torn down as soon as boot
    // completes (natural timeout or interrupt), not only on unmount. They
    // previously were removed only in the effect's unmount cleanup, so
    // after a normal (non-interrupted) boot finished, they stayed attached
    // to `window` for the rest of the Gate's lifetime — silently
    // stopPropagation()-ing every later click/keydown anywhere on the
    // page, including a click or Enter/Space on the now-"active" Enter
    // button, before it ever reached the button. That's why the CTA looked
    // enabled but did nothing.
    function removeInterruptListeners() {
      window.removeEventListener("keydown", interrupt, { capture: true });
      window.removeEventListener("click", interrupt, { capture: true });
    }

    function finish() {
      if (readyFired.current) return;
      readyFired.current = true;
      window.clearTimeout(timeout);
      removeInterruptListeners();
      onReady();
    }

    function interrupt(event: Event) {
      event.stopPropagation();
      setInstant(true);
      finish();
    }

    timeout = window.setTimeout(finish, totalDuration);
    window.addEventListener("keydown", interrupt, { capture: true });
    window.addEventListener("click", interrupt, { capture: true });

    return () => {
      window.clearTimeout(timeout);
      removeInterruptListeners();
    };
    // Intentionally mount-only: this sequence runs exactly once per Gate
    // mount, per the required behavior — it does not react to later
    // prop/state changes (a re-render while already on the Gate must not
    // restart it).
  }, []);

  return (
    <div className={`boot-sequence${instant ? " boot-sequence--instant" : ""}`}>
      {lines.map((line, index) => (
        <p
          key={line}
          className={`boot-sequence__line${index === 0 ? " boot-sequence__line--glitch" : ""}`}
          style={{ animationDelay: `${index * LINE_STAGGER_MS}ms` }}
        >
          {line}
        </p>
      ))}
    </div>
  );
}
