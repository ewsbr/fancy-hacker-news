import type { HeaderUser, ParsedHeader } from '@/parsers/header';
import { inject } from 'vue';

export interface CurrentUserState {
  user: HeaderUser | null;
  /** Logged-out users submit auth actions natively so HN can show its login gate. */
  isLoggedIn: boolean;
  hasAuthControls: boolean;
  profileUrl: string | null;
  loginUrl: string | null;
  logoutUrl: string | null;
}

export function resolveCurrentUser(header: ParsedHeader): CurrentUserState {
  return {
    user: header.user,
    isLoggedIn: header.user !== null,
    hasAuthControls: header.hasAuthControls,
    profileUrl: header.user && `user?id=${encodeURIComponent(header.user.name)}`,
    loginUrl: header.loginUrl,
    logoutUrl: header.logoutUrl,
  };
}

export function useCurrentUser(): CurrentUserState {
  return resolveCurrentUser(inject<ParsedHeader>('header')!);
}
