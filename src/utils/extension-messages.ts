export const OPEN_SETTINGS_MESSAGE = { type: 'fancy-hn/open-settings' } as const;

export type OpenSettingsResponse = { ok: true } | { ok: false; error: string };
