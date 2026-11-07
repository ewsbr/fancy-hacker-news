export function parseGrayLevel(el: Element | null | undefined): string | null {
  const grayClass = Array.from(el?.classList ?? []).find(className => /^c[0-9a-f]{2}$/i.test(className));
  return grayClass?.toLowerCase() ?? null;
}
