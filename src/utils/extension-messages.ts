import type { HnActionResult } from '@/utils/hn-action-request';

export const OPEN_SETTINGS_MESSAGE = { type: 'fancy-hn/open-settings' } as const;

export type OpenSettingsResponse = { ok: true } | { ok: false; error: string };

export const REQUEST_HN_ACTION_MESSAGE_TYPE = 'fancy-hn/request-hn-action';

export interface RequestHnActionMessage {
  type: typeof REQUEST_HN_ACTION_MESSAGE_TYPE;
  url: string;
}

export type RequestHnActionResponse = { ok: true; result: HnActionResult } | { ok: false; error: string };

export function makeRequestHnActionMessage(url: string): RequestHnActionMessage {
  return { type: REQUEST_HN_ACTION_MESSAGE_TYPE, url };
}
