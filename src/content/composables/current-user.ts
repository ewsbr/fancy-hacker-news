import type { HeaderUser, ParsedHeader } from '@/parsers/header';
import { inject } from 'vue';

export type CurrentUserStatus = 'logged-in' | 'logged-out' | 'unknown';

export interface CurrentUserState {
  status: CurrentUserStatus;
  user: HeaderUser | null;
  isLoggedIn: boolean;
  isLoggedOut: boolean;
  hasAuthControls: boolean;
  profileUrl: string | null;
  loginUrl: string | null;
  logoutUrl: string | null;
}

export function resolveCurrentUser(header: ParsedHeader | null | undefined): CurrentUserState {
  if (header == null) {
    return {
      status: 'unknown',
      user: null,
      isLoggedIn: false,
      isLoggedOut: false,
      hasAuthControls: false,
      profileUrl: null,
      loginUrl: null,
      logoutUrl: null,
    };
  }

  if (header.user != null) {
    return {
      status: 'logged-in',
      user: header.user,
      isLoggedIn: true,
      isLoggedOut: false,
      hasAuthControls: header.hasAuthControls,
      profileUrl: `user?id=${encodeURIComponent(header.user.name)}`,
      loginUrl: header.loginUrl,
      logoutUrl: header.logoutUrl,
    };
  }

  return {
    status: 'logged-out',
    user: null,
    isLoggedIn: false,
    isLoggedOut: true,
    hasAuthControls: header.hasAuthControls,
    profileUrl: null,
    loginUrl: header.loginUrl,
    logoutUrl: header.logoutUrl,
  };
}

/**
 * Missing auth context happens in isolated component mounts. Only a known logged-out
 * HN header should force native navigation to the HN auth gate.
 */
export function canSubmitAuthActionInBackground(currentUser: CurrentUserState): boolean {
  return currentUser.status !== 'logged-out';
}

export function useCurrentUser(): CurrentUserState {
  return resolveCurrentUser(inject<ParsedHeader | null>('header', null));
}
