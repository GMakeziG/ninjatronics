import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NAVIGATION_COMMANDS } from "./navigationCommands.js";
import { isEditableTarget } from "../../lib/dom.js";

/** How long a bare `g` keypress stays "pending" before it expires. */
export const G_PREFIX_TIMEOUT_MS = 1200;

export interface GlobalShortcutsState {
  helpOpen: boolean;
  closeHelp: () => void;
}

/**
 * Global keyboard navigation layer: `g` then a letter jumps to a route
 * (see navigationCommands.ts), `?` toggles the shortcut help overlay,
 * `Escape` closes it. Mounted once, in AppShell.
 */
export function useGlobalShortcuts(): GlobalShortcutsState {
  const navigate = useNavigate();
  const [helpOpen, setHelpOpen] = useState(false);
  const gPendingRef = useRef(false);
  const gTimeoutRef = useRef<number | undefined>(undefined);

  const clearGPending = useCallback(() => {
    gPendingRef.current = false;
    if (gTimeoutRef.current !== undefined) {
      window.clearTimeout(gTimeoutRef.current);
      gTimeoutRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Never hijack browser/OS shortcuts (Ctrl+F, Cmd+R, Alt+Tab, ...).
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      // Never interfere with normal typing, including a future Terminal input.
      if (isEditableTarget(event.target)) return;

      if (event.key === "Escape") {
        clearGPending();
        if (helpOpen) {
          event.preventDefault();
          setHelpOpen(false);
        }
        return;
      }

      if (event.key === "?") {
        event.preventDefault();
        clearGPending();
        setHelpOpen((open) => !open);
        return;
      }

      if (gPendingRef.current) {
        clearGPending();
        const command = NAVIGATION_COMMANDS.find(
          (candidate) => candidate.keys[0] === "g" && candidate.keys[1] === event.key.toLowerCase(),
        );
        if (command) {
          event.preventDefault();
          setHelpOpen(false);
          navigate(command.path);
        }
        return;
      }

      if (event.key.toLowerCase() === "g") {
        gPendingRef.current = true;
        gTimeoutRef.current = window.setTimeout(clearGPending, G_PREFIX_TIMEOUT_MS);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      clearGPending();
    };
  }, [navigate, helpOpen, clearGPending]);

  return { helpOpen, closeHelp: () => setHelpOpen(false) };
}
