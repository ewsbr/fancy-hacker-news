import { hrefOf } from './dom';

export function findUnvoteHref(scope: ParentNode | null | undefined): string | null {
  if (!scope) return null;
  return hrefOf(scope.querySelector('a[href^="vote?"][href*="how=un"]'));
}

export function isNewUser(hnuserEl: Element | null | undefined): boolean {
  if (!hnuserEl) return false;
  return hnuserEl.querySelector('font[color="#3c963c"]') !== null;
}

export function parseGrayLevel(el: Element | null | undefined): string | null {
  if (!el) return null;
  const classes = Array.from(el.classList);
  const grayClass = classes.find(className => /^c[0-9a-fA-F]{2}$/.test(className));
  return grayClass?.toLowerCase() || null;
}