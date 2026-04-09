const FOCUSABLE_SELECTOR = [
  'a[href]:not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function isVisible(element: HTMLElement) {
  if (element.hasAttribute('hidden')) {
    return false;
  }

  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }

  return element.offsetParent !== null || style.position === 'fixed';
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter(isVisible);
}

export function trapFocusWithin(event: KeyboardEvent, container: HTMLElement) {
  if (event.key !== 'Tab') {
    return false;
  }

  const focusableElements = getFocusableElements(container);
  if (focusableElements.length === 0) {
    event.preventDefault();
    container.focus();
    return true;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  if (event.shiftKey) {
    if (!activeElement || activeElement === firstElement || !container.contains(activeElement)) {
      event.preventDefault();
      lastElement.focus();
      return true;
    }

    return false;
  }

  if (!activeElement || activeElement === lastElement || !container.contains(activeElement)) {
    event.preventDefault();
    firstElement.focus();
    return true;
  }

  return false;
}

export function restoreFocus(target: HTMLElement | null | undefined) {
  if (!target || !target.isConnected || target === document.body) {
    return;
  }

  target.focus();
}