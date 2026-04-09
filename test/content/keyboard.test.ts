import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import { isEditableTarget, isSearchShortcutEvent } from '@/content/utils/keyboard';

describe('keyboard helpers', () => {
  let dom: JSDOM;

  beforeEach(() => {
    dom = new JSDOM(`
      <body>
        <button id="trigger">Open</button>
        <input id="input" />
        <textarea id="textarea"></textarea>
        <div id="editor" contenteditable="true"></div>
      </body>
    `);

    Object.defineProperty(globalThis, 'window', {
      value: dom.window,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'document', {
      value: dom.window.document,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'HTMLElement', {
      value: dom.window.HTMLElement,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'Node', {
      value: dom.window.Node,
      configurable: true,
    });
  });

  afterEach(() => {
    dom.window.close();
    Reflect.deleteProperty(globalThis, 'window');
    Reflect.deleteProperty(globalThis, 'document');
    Reflect.deleteProperty(globalThis, 'HTMLElement');
    Reflect.deleteProperty(globalThis, 'Node');
  });

  it('treats standard form controls and contenteditable regions as editable', () => {
    expect(isEditableTarget(document.getElementById('input'))).toBe(true);
    expect(isEditableTarget(document.getElementById('textarea'))).toBe(true);
    expect(isEditableTarget(document.getElementById('editor'))).toBe(true);
    expect(isEditableTarget(document.getElementById('trigger'))).toBe(false);
  });

  it('allows Cmd/Ctrl+K when focus is outside editable controls', () => {
    const event = new dom.window.KeyboardEvent('keydown', {
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
    const inputEvent = new dom.window.KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
    });
    Object.defineProperty(inputEvent, 'target', {
      value: inputTarget,
      configurable: true,
    });

    const shiftedEvent = new dom.window.KeyboardEvent('keydown', {
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
