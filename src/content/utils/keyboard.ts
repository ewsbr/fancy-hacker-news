const EDITABLE_SELECTOR = 'input, textarea, select, [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]';

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Node)) {
    return false;
  }

  const element = target instanceof HTMLElement ? target : target.parentElement;
  return element !== null && (element.isContentEditable || element.closest(EDITABLE_SELECTOR) !== null);
}

export function isSearchShortcutEvent(event: KeyboardEvent): boolean {
  return !event.defaultPrevented
    && !event.isComposing
    && !event.altKey
    && !event.shiftKey
    && (event.metaKey || event.ctrlKey)
    && event.key.toLowerCase() === 'k'
    && !isEditableTarget(event.target);
}
