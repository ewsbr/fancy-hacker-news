// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { isEditableTarget, isSearchShortcutEvent } from '@/content/utils/keyboard';

describe('keyboard helpers', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <body>
        <button id="trigger">Open</button>
        <input id="input" />
        <textarea id="textarea"></textarea>
        <div id="editor" contenteditable="true"></div>
      </body>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('treats standard form controls and contenteditable regions as editable', () => {
    expect(isEditableTarget(document.getElementById('input'))).toBe(true);
    expect(isEditableTarget(document.getElementById('textarea'))).toBe(true);
    expect(isEditableTarget(document.getElementById('editor'))).toBe(true);
    expect(isEditableTarget(document.getElementById('trigger'))).toBe(false);
  });

  it('allows Cmd/Ctrl+K when focus is outside editable controls', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    });

    Object.defineProperty(event, 'target', {
      value: document.getElementById('trigger'),
      configurable: true,
    });

    expect(isSearchShortcutEvent(event)).toBe(true);
  });

  it('ignores Cmd/Ctrl+K inside editable controls or modified shortcut variants', () => {
    const inputTarget = document.getElementById('input');
    const inputEvent = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
    });
    Object.defineProperty(inputEvent, 'target', {
      value: inputTarget,
      configurable: true,
    });

    const shiftedEvent = new KeyboardEvent('keydown', {
      key: 'K',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });
    Object.defineProperty(shiftedEvent, 'target', {
      value: document.getElementById('trigger'),
      configurable: true,
    });

    expect(isSearchShortcutEvent(inputEvent)).toBe(false);
    expect(isSearchShortcutEvent(shiftedEvent)).toBe(false);
  });
});
