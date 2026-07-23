import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isEditableTarget } from "../../lib/dom.js";
import { runTerminalCommand } from "./runTerminalCommand.js";
import type { TerminalCommandContext } from "./terminalCommands.js";

export interface TerminalLine {
  id: number;
  kind: "input" | "output";
  text: string;
}

export interface TerminalState {
  isOpen: boolean;
  lines: TerminalLine[];
  open: () => void;
  close: () => void;
  submit: (rawInput: string) => void;
}

/**
 * Owns terminal open/closed state, its output log, and the global `` ` ``
 * key that opens it. Closing (`` ` ``, Escape, "exit") is handled locally
 * by the Terminal component itself, since by then focus is inside its own
 * input — see Terminal.tsx for why that alone is enough to suspend global
 * shortcuts without this hook coordinating with useGlobalShortcuts at all.
 *
 * The "press ` or Esc to close / type help" hint now lives as static
 * chrome in Terminal.tsx's header, not as a seeded log line — so it's
 * never repeated into the log and `clear` can wipe output to nothing
 * instead of re-seeding a message.
 */
export function useTerminal(): TerminalState {
  const navigate = useNavigate();
  const idRef = useRef(0);
  const nextId = () => ++idRef.current;

  const [isOpen, setIsOpen] = useState(false);
  const [lines, setLines] = useState<TerminalLine[]>([]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const clearOutput = useCallback(() => setLines([]), []);

  const submit = useCallback(
    (rawInput: string) => {
      const trimmed = rawInput.trim();
      if (!trimmed) return;

      const context: TerminalCommandContext = { navigate, clear: clearOutput, close };
      const output = runTerminalCommand(trimmed, context);

      setLines((current) => [
        ...current,
        { id: nextId(), kind: "input", text: trimmed },
        ...output.map((text) => ({ id: nextId(), kind: "output" as const, text })),
      ]);
    },
    [navigate, clearOutput, close],
  );

  useEffect(() => {
    // Only responsible for *opening*. While open, focus is inside the
    // terminal's own input, so this listener never has to worry about
    // "did the user just type a backtick into the command box" — that
    // case is handled locally by the input itself (see Terminal.tsx).
    const onKeyDown = (event: KeyboardEvent) => {
      if (isOpen) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isEditableTarget(event.target)) return;
      if (event.key !== "`") return;

      event.preventDefault();
      setIsOpen(true);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return { isOpen, lines, open, close, submit };
}
