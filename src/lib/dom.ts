// Tiny shared DOM check — used by every global keydown listener that must
// never interfere with typing (useGlobalShortcuts, useTerminal). Extracted
// here once a second real consumer needed it, rather than duplicated.

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}
