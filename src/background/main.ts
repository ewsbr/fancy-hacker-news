import type { OpenSettingsResponse, RequestHnActionResponse } from '@/utils/extension-messages';
import { createLogger } from '@/debug';
import { OPEN_SETTINGS_MESSAGE, REQUEST_HN_ACTION_MESSAGE_TYPE } from '@/utils/extension-messages';
import { isHnUrl, requestHnAction } from '@/utils/hn-action-request';

const logger = createLogger('background');

function openSettingsPage(sendResponse: (response: OpenSettingsResponse) => void) {
  // Firefox's callback-style chrome namespace may not return a promise.
  Promise.resolve(chrome.runtime.openOptionsPage()).then(
    () => sendResponse({ ok: true }),
    (error: Error) => {
      logger.warn('Failed to open settings page', error);
      sendResponse({ ok: false, error: error.message });
    },
  );
}

function requestHnActionFromBackground(url: string, sendResponse: (response: RequestHnActionResponse) => void) {
  requestHnAction(url).then(
    result => sendResponse({ ok: true, result }),
    (error: Error) => {
      logger.warn('Failed to request HN action', error);
      sendResponse({ ok: false, error: error.message });
    },
  );
}

chrome.runtime.onMessage.addListener((message: { type?: unknown; url?: unknown } | undefined, _sender, sendResponse) => {
  if (message?.type === OPEN_SETTINGS_MESSAGE.type) {
    openSettingsPage(sendResponse);
    return true;
  }

  if (message?.type === REQUEST_HN_ACTION_MESSAGE_TYPE && typeof message.url === 'string' && isHnUrl(message.url)) {
    requestHnActionFromBackground(message.url, sendResponse);
    return true;
  }

  return false;
});
