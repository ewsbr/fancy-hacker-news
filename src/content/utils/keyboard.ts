const EDITABLE_SELECTOR = 'input, textarea, select, [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]';

function hasDomElementGlobals(): boolean {
  return typeof Node !== 'undefined' && typeof HTMLElement !== 'undefined';
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!hasDomElementGlobals() || !(target instanceof Node)) {
    return false;
  }

  const element = target instanceof HTMLElement ? target : target.parentElement;
  if (!element) {
    return false;
  }

  if (element.isContentEditable) {
    return true;
  }

  return element.closest(EDITABLE_SELECTOR) instanceof HTMLElement;
}

export function isSearchShortcutEvent(event: KeyboardEvent): boolean {
  if (event.defaultPrevented || event.isComposing) {
    return false;
  }

  if (event.altKey || event.shiftKey) {
    return false;
  }

  if (!(event.metaKey || event.ctrlKey)) {
    return false;
  }

  if (event.key.toLowerCase() !== 'k') {
    return false;
  }

  return !isEditableTarget(event.target);
}
