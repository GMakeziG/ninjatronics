import { useEffect, useRef, useState } from "react";
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
  close: () => void;
  submit: (rawInput: string) => void;
}

const WELCOME_LINE = 'Ninjatronics Terminal — type "help" for available commands.';

/**
 * Owns terminal open/closed state, its output log, and the global `` ` ``
 * key that opens it. Closing (`` ` ``, Escape, "exit") is handled locally
 * by the Terminal component itself, since by then focus is inside its own
 * input — see Terminal.tsx for why that alone is enough to suspend global
 * shortcuts without this hook coordinating with useGlobalShortcuts at all.
 */
export function useTerminal(): TerminalState {
  const navigate = useNavigate();
  const idRef = useRef(0);
  const nextId = () => ++idRef.current;

  const [isOpen, setIsOpen] = useState(false);
  const [lines, setLines] = useState<TerminalLine[]>([{ id: nextId(), kind: "output", text: WELCOME_LINE }]);

  const close = () => setIsOpen(false);

  const clearOutput = () => setLines([{ id: nextId(), kind: "output", text: WELCOME_LINE }]);

  const submit = (rawInput: string) => {
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    const context: TerminalCommandContext = { navigate, clear: clearOutput, close };
    const output = runTerminalCommand(trimmed, context);

    setLines((current) => [
      ...current,
      { id: nextId(), kind: "input", text: trimmed },
      ...output.map((text) => ({ id: nextId(), kind: "output" as const, text })),
    ]);
  };

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

  return { isOpen, lines, close, submit };
}
