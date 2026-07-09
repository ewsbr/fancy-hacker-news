import type {
  OpenSettingsResponse,
} from '@/utils/extension-messages';
import { EXTENSION_MESSAGE_TYPES } from '@/constants/extension-messages';
import { createLogger } from '@/debug';
import {
  extensionMessageSchema,
} from '@/utils/extension-messages';

const backgroundLogger = createLogger('background');

function makeOpenSettingsErrorResponse(error: unknown): Extract<OpenSettingsResponse, { ok: false }> {
  if (error instanceof Error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  throw error;
}

function openSettingsPage(sendResponse: (response: OpenSettingsResponse) => void) {
  void Promise.resolve(chrome.runtime.openOptionsPage())
    .then(() => {
      sendResponse({ ok: true });
    })
    .catch((error: unknown) => {
      const response = makeOpenSettingsErrorResponse(error);
      backgroundLogger.warn('Failed to open settings page', { error: response.error });
      sendResponse(response);
    });
}

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  const parsedMessage = extensionMessageSchema.safeParse(message);
  if (!parsedMessage.success) {
    return false;
  }

  switch (parsedMessage.data.type) {
    case EXTENSION_MESSAGE_TYPES.OPEN_SETTINGS:
      openSettingsPage(sendResponse);
      return true;
  }
});
