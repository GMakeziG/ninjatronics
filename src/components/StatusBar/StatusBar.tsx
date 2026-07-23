import "./StatusBar.css";
import { Breadcrumbs, type BreadcrumbItem } from "./Breadcrumbs.js";
import { WorldStatus } from "./WorldStatus.js";
import { LiveClock } from "./LiveClock.js";

export interface StatusBarProps {
  breadcrumb: BreadcrumbItem[];
  districtsOpen: number;
  districtsTotal: number;
  onOpenTerminal: () => void;
  onOpenShortcutHelp: () => void;
}

export function StatusBar({
  breadcrumb,
  districtsOpen,
  districtsTotal,
  onOpenTerminal,
  onOpenShortcutHelp,
}: StatusBarProps) {
  return (
    <header className="status-bar">
      <div className="status-bar__section status-bar__section--start">
        <span className="status-bar__dot" aria-hidden="true" />
        <span className="status-bar__product">NINJATRONICS.IO</span>
      </div>

      <div className="status-bar__section status-bar__section--center">
        <Breadcrumbs items={breadcrumb} />
      </div>

      <div className="status-bar__section status-bar__section--end">
        <WorldStatus districtsOpen={districtsOpen} districtsTotal={districtsTotal} />
        <span className="status-bar__divider" aria-hidden="true">
          ·
        </span>
        <LiveClock />
        <span className="status-bar__divider" aria-hidden="true">
          ·
        </span>
        <div className="status-bar__hints">
          <button type="button" className="status-bar__hint" onClick={onOpenTerminal} aria-label="Open Terminal">
            <kbd>`</kbd>
            <span className="status-bar__hint-label">Terminal</span>
          </button>
          <button
            type="button"
            className="status-bar__hint"
            onClick={onOpenShortcutHelp}
            aria-label="Open keyboard shortcuts help"
          >
            <kbd>?</kbd>
            <span className="status-bar__hint-label">Shortcuts</span>
          </button>
        </div>
      </div>
    </header>
  );
}
