import type { MaybeRefOrGetter } from 'vue';
import { computed, toValue } from 'vue';
import { useExtensionSettings } from '@/state/settings-context';

const NEW_TAB_REL_VALUES = ['noopener', 'noreferrer'] as const;
const DEFAULT_LINK_BASE_URL = 'https://news.ycombinator.com/';

function getLinkBaseUrl(): string {
  return globalThis.location?.href ?? DEFAULT_LINK_BASE_URL;
}

function isHttpNavigationHref(href: string): boolean {
  const trimmedHref = href.trim();
  if (!trimmedHref || trimmedHref.startsWith('#')) {
    return false;
  }

  try {
    const url = new URL(trimmedHref, getLinkBaseUrl());
    return url.protocol === 'http:' || url.protocol === 'https:';
  }
  catch {
    return false;
  }
}

function mergeRelValues(rel: string | null): string {
  const values = new Set((rel ?? '').split(/\s+/).filter(Boolean));
  for (const value of NEW_TAB_REL_VALUES) {
    values.add(value);
  }

  return Array.from(values).join(' ');
}

export function getNewTabLinkAttrs(openLinksInNewTab: boolean, href: string | null | undefined) {
  if (!openLinksInNewTab || !href || !isHttpNavigationHref(href)) {
    return {};
  }

  return {
    target: '_blank',
    rel: NEW_TAB_REL_VALUES.join(' '),
  };
}

export function addNewTabTargetsToHtml(html: string, openLinksInNewTab: boolean): string {
  if (!openLinksInNewTab || !html || typeof document === 'undefined') {
    return html;
  }

  const template = document.createElement('template');
  template.innerHTML = html;

  for (const link of template.content.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    const href = link.getAttribute('href');
    if (!href || !isHttpNavigationHref(href)) {
      continue;
    }

    link.target = '_blank';
    link.setAttribute('rel', mergeRelValues(link.getAttribute('rel')));
  }

  return template.innerHTML;
}

export function useNewTabLinkAttrs(href: MaybeRefOrGetter<string | null | undefined>) {
  const settings = useExtensionSettings();

  return computed(() => getNewTabLinkAttrs(settings.features.openLinksInNewTab, toValue(href)));
}
