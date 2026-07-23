import { useEffect, useRef, type FormEvent, type KeyboardEvent } from "react";
import "./Terminal.css";
import type { TerminalLine } from "../../app/terminal/useTerminal.js";

export interface TerminalProps {
  open: boolean;
  lines: TerminalLine[];
  onClose: () => void;
  onSubmit: (input: string) => void;
}

/**
 * Non-modal docked panel (Design Tokens.md's --z-docked-overlay tier, same
 * as the future OracleOverlay — distinct from a true Modal). Background
 * content stays visible/interactive; this is a dismissible utility panel,
 * not a page-blocking dialog, so it uses `role="region"` rather than
 * `role="dialog"`/`aria-modal`.
 */
export function Terminal({ open, lines, onClose, onSubmit }: TerminalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      inputRef.current?.focus();
    } else {
      previouslyFocused.current?.focus();
      previouslyFocused.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const container = outputRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [lines, open]);

  if (!open) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = inputRef.current;
    if (!input) return;
    onSubmit(input.value);
    event.currentTarget.reset();
  };

  // Backtick while focus is inside the terminal closes it (rather than
  // typing a literal backtick into the command box) — the global open
  // listener in useTerminal.ts only ever handles *opening*, so this is the
  // one place backtick-while-open is handled.
  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape" || event.key === "`") {
      event.preventDefault();
      onClose();
    }
  };

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      'button, input, a[href], [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      ref={panelRef}
      className="terminal"
      role="region"
      aria-label="Ninjatronics Terminal"
      onKeyDown={handlePanelKeyDown}
    >
      <div className="terminal__header">
        <div className="terminal__heading">
          <span className="terminal__title">NINJATRONICS TERMINAL</span>
          <span className="terminal__hint">
            Press <kbd>`</kbd> or <kbd>Esc</kbd> to close · Type &quot;help&quot; for commands
          </span>
        </div>
        <button type="button" className="terminal__close" onClick={onClose}>
          Close
        </button>
      </div>

      <div ref={outputRef} className="terminal__output" aria-live="polite">
        {lines.map((line) => (
          <p key={line.id} className={`terminal__line terminal__line--${line.kind}`}>
            {line.kind === "input" && (
              <span className="terminal__prompt" aria-hidden="true">
                &gt;
              </span>
            )}{" "}
            {line.text}
          </p>
        ))}
      </div>

      <form className="terminal__form" onSubmit={handleSubmit}>
        <span className="terminal__prompt" aria-hidden="true">
          &gt;
        </span>
        <input
          ref={inputRef}
          type="text"
          className="terminal__input"
          onKeyDown={handleInputKeyDown}
          aria-label="Terminal command input"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </form>
    </div>
  );
}
