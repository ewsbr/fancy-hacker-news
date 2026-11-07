import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeRequestHnActionMessage } from '@/utils/extension-messages';

type RuntimeMessageListener = (
  message: unknown,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void,
) => boolean | undefined;

async function loadBackgroundListener(): Promise<RuntimeMessageListener> {
  const listeners: RuntimeMessageListener[] = [];
  vi.stubGlobal('chrome', {
    runtime: {
      onMessage: {
        addListener: vi.fn((listener: RuntimeMessageListener) => {
          listeners.push(listener);
        }),
      },
    },
  });

  await import('@/background/main');
  return listeners[0]!;
}

describe('background HN action request', () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('requests the HN action and returns whether HN accepted it', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 0, type: 'opaqueredirect', url: '' });
    vi.stubGlobal('fetch', fetchMock);
    const listener = await loadBackgroundListener();
    const url = 'https://news.ycombinator.com/vote?id=10&how=up&auth=a&goto=news&js=t';

    const response = await new Promise((resolve) => {
      expect(listener(makeRequestHnActionMessage(url), {}, resolve)).toBe(true);
    });

    expect(fetchMock).toHaveBeenCalledWith(url, expect.objectContaining({ credentials: 'include', redirect: 'manual' }));
    expect(response).toEqual({ ok: true, result: 'accepted' });
  });

  it('ignores URLs outside HN', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const listener = await loadBackgroundListener();

    expect(listener(makeRequestHnActionMessage('https://example.com/vote?id=10'), {}, vi.fn())).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
