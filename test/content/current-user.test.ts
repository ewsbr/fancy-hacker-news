import type { ParsedHeader } from '@/parsers/header';
import { describe, expect, it } from 'vitest';
import {
  canSubmitAuthActionInBackground,
  resolveCurrentUser,
} from '@/content/composables/current-user';

function makeHeader(user: ParsedHeader['user']): ParsedHeader {
  return {
    navLinks: [],
    hasAuthControls: true,
    user,
    loginUrl: user == null ? 'login?goto=news' : null,
    logoutUrl: user == null ? null : 'logout?auth=logoutauth',
    topBarColor: '#ff6600',
    hasCustomTopBarColor: false,
    hasMemorialBar: false,
    memorialBarColor: null,
  };
}

describe('current user', () => {
  it('resolves logged-in user state from parsed auth controls', () => {
    const currentUser = resolveCurrentUser(makeHeader({ name: 'ews', karma: 123 }));

    expect(currentUser.status).toBe('logged-in');
    expect(currentUser.user).toEqual({ name: 'ews', karma: 123 });
    expect(currentUser.isLoggedIn).toBe(true);
    expect(currentUser.isLoggedOut).toBe(false);
    expect(currentUser.hasAuthControls).toBe(true);
    expect(currentUser.profileUrl).toBe('user?id=ews');
    expect(currentUser.logoutUrl).toBe('logout?auth=logoutauth');
    expect(canSubmitAuthActionInBackground(currentUser)).toBe(true);
  });

  it('resolves logged-out user state from parsed login controls', () => {
    const currentUser = resolveCurrentUser(makeHeader(null));

    expect(currentUser.status).toBe('logged-out');
    expect(currentUser.user).toBeNull();
    expect(currentUser.isLoggedIn).toBe(false);
    expect(currentUser.isLoggedOut).toBe(true);
    expect(currentUser.hasAuthControls).toBe(true);
    expect(currentUser.profileUrl).toBeNull();
    expect(currentUser.loginUrl).toBe('login?goto=news');
    expect(canSubmitAuthActionInBackground(currentUser)).toBe(false);
  });

  it('keeps missing user context separate from logged-out state', () => {
    const currentUser = resolveCurrentUser(null);

    expect(currentUser.status).toBe('unknown');
    expect(currentUser.user).toBeNull();
    expect(currentUser.isLoggedIn).toBe(false);
    expect(currentUser.isLoggedOut).toBe(false);
    expect(currentUser.hasAuthControls).toBe(false);
    expect(currentUser.profileUrl).toBeNull();
    expect(canSubmitAuthActionInBackground(currentUser)).toBe(true);
  });
});
