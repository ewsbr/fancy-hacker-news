import type { OpenSettingsResponse } from '@/utils/extension-messages';
import { createLogger } from '@/debug';
import { OPEN_SETTINGS_MESSAGE } from '@/utils/extension-messages';

const logger = createLogger('background');

chrome.runtime.onMessage.addListener((message: { type?: unknown }, _sender, sendResponse: (response: OpenSettingsResponse) => void) => {
  if (message?.type !== OPEN_SETTINGS_MESSAGE.type) {
    return false;
  }

  // Firefox's callback-style chrome namespace may not return a promise.
  Promise.resolve(chrome.runtime.openOptionsPage()).then(
    () => sendResponse({ ok: true }),
    (error: Error) => {
      logger.warn('Failed to open settings page', error);
      sendResponse({ ok: false, error: error.message });
    },
  );
  return true;
});
