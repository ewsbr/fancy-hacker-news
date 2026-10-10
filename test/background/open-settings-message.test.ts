import { afterEach, describe, expect, it, vi } from 'vitest';
import { OPEN_SETTINGS_MESSAGE } from '@/utils/extension-messages';

type RuntimeMessageListener = (
  message: unknown,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void,
) => boolean | undefined;

describe('background open settings message', () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('opens the options page when requested by a content script', async () => {
    const listeners: RuntimeMessageListener[] = [];
    const openOptionsPage = vi.fn(() => Promise.resolve());

    vi.stubGlobal('chrome', {
      runtime: {
        onMessage: {
          addListener: vi.fn((listener: RuntimeMessageListener) => {
            listeners.push(listener);
          }),
        },
        openOptionsPage,
      },
    });

    await import('@/background/main');

    const sendResponse = vi.fn();
    const keepsChannelOpen = listeners[0]?.(
      OPEN_SETTINGS_MESSAGE,
      {},
      sendResponse,
    );

    await Promise.resolve();
    await Promise.resolve();

    expect(keepsChannelOpen).toBe(true);
    expect(openOptionsPage).toHaveBeenCalledTimes(1);
    expect(sendResponse).toHaveBeenCalledWith({ ok: true });
  });
});
