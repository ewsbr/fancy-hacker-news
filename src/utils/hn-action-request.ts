import { HN_ORIGIN } from '@/constants/hn-actions';

export type HnActionResult = 'accepted' | 'rejected';

export function isHnUrl(url: string): boolean {
  return URL.parse(url)?.origin === HN_ORIGIN;
}

export async function requestHnAction(url: string): Promise<HnActionResult> {
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
    redirect: 'manual',
  });

  // HN answers successful actions with a redirect, or with /ok for js=t votes.
  const accepted = response.type === 'opaqueredirect'
    || (response.status >= 300 && response.status < 400)
    || (response.ok && new URL(response.url).pathname === '/ok');
  return accepted ? 'accepted' : 'rejected';
}
