import { z } from 'zod';
import { EXTENSION_MESSAGE_TYPES } from '@/constants/extension-messages';

export const openSettingsMessageSchema = z.object({
  type: z.literal(EXTENSION_MESSAGE_TYPES.OPEN_SETTINGS),
}).strict();

export const extensionMessageSchema = z.discriminatedUnion('type', [
  openSettingsMessageSchema,
]);

export const openSettingsResponseSchema = z.union([
  z.object({
    ok: z.literal(true),
  }).strict(),
  z.object({
    ok: z.literal(false),
    error: z.string().min(1),
  }).strict(),
]);

export type OpenSettingsMessage = z.infer<typeof openSettingsMessageSchema>;
export type OpenSettingsResponse = z.infer<typeof openSettingsResponseSchema>;

export function makeOpenSettingsMessage(): OpenSettingsMessage {
  return {
    type: EXTENSION_MESSAGE_TYPES.OPEN_SETTINGS,
  };
}
