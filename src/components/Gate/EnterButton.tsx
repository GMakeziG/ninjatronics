import "./EnterButton.css";

export interface EnterButtonProps {
  ready: boolean;
  onEnter: () => void;
}

export function EnterButton({ ready, onEnter }: EnterButtonProps) {
  return (
    <button type="button" className="enter-button" disabled={!ready} onClick={onEnter}>
      Enter the Valley <span aria-hidden="true">→</span>
    </button>
  );
}
