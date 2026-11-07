export function findUserLink(scope: ParentNode | null | undefined): HTMLAnchorElement | null {
  return scope?.querySelector<HTMLAnchorElement>('a[href^="user?id="]') ?? null;
}

export function isNewUser(userLink: Element | null | undefined): boolean {
  return userLink?.querySelector('font[color="#3c963c"]') != null;
}
