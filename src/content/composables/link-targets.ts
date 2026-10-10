import type { MaybeRefOrGetter } from 'vue';
import { computed, toValue } from 'vue';
import { useExtensionSettings } from '@/state/settings-context';

const NEW_TAB_REL = 'noopener noreferrer';

function isHttpNavigationHref(href: string): boolean {
  const trimmedHref = href.trim();
  if (!trimmedHref || trimmedHref.startsWith('#')) {
    return false;
  }

  try {
    return /^https?:$/.test(new URL(trimmedHref, location.href).protocol);
  } catch {
    return false;
  }
}

export function addNewTabTargetsToHtml(html: string, openLinksInNewTab: boolean): string {
  if (!openLinksInNewTab || !html) {
    return html;
  }

  const template = document.createElement('template');
  template.innerHTML = html;

  for (const link of template.content.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    if (isHttpNavigationHref(link.getAttribute('href')!)) {
      link.target = '_blank';
      link.relList.add('noopener', 'noreferrer');
    }
  }

  return template.innerHTML;
}

export function useNewTabLinkAttrs(href: MaybeRefOrGetter<string | null | undefined>) {
  const settings = useExtensionSettings();

  return computed(() => {
    const value = toValue(href);
    return settings.features.openLinksInNewTab && value && isHttpNavigationHref(value)
      ? { target: '_blank', rel: NEW_TAB_REL }
      : {};
  });
}
