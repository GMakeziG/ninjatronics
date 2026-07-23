import { useEffect, useRef, type KeyboardEvent, type MouseEvent } from "react";
import "./ShortcutHelp.css";
import type { NavigationCommand } from "../../app/navigation/navigationCommands.js";

export interface ShortcutHelpProps {
  open: boolean;
  onClose: () => void;
  commands: NavigationCommand[];
}

const KEY_LABEL: Record<string, string> = { g: "G", v: "V", b: "B", h: "H" };

function formatKeys(keys: string[]): string {
  return keys.map((key) => KEY_LABEL[key] ?? key.toUpperCase()).join(" then ");
}

export function ShortcutHelp({ open, onClose, commands }: ShortcutHelpProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      dialogRef.current?.focus();
    } else {
      previouslyFocused.current?.focus();
      previouslyFocused.current = null;
    }
  }, [open]);

  if (!open) return null;

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button, a[href], [tabindex]:not([tabindex="-1"])',
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
    <div className="shortcut-help__backdrop" onClick={handleBackdropClick}>
      <div
        ref={dialogRef}
        className="shortcut-help"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcut-help-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <div className="shortcut-help__header">
          <h2 id="shortcut-help-title" className="shortcut-help__title">
            Keyboard Shortcuts
          </h2>
          <button type="button" className="shortcut-help__close" onClick={onClose}>
            Close
          </button>
        </div>

        <ul className="shortcut-help__list">
          {commands.map((command) => (
            <li key={command.id} className="shortcut-help__item">
              <kbd className="shortcut-help__keys">{formatKeys(command.keys)}</kbd>
              <span className="shortcut-help__label">{command.label}</span>
            </li>
          ))}
          <li className="shortcut-help__item">
            <kbd className="shortcut-help__keys">?</kbd>
            <span className="shortcut-help__label">Toggle this help</span>
          </li>
          <li className="shortcut-help__item">
            <kbd className="shortcut-help__keys">Esc</kbd>
            <span className="shortcut-help__label">Close this help</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
