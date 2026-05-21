export function pickPseudoRandomIndex(seed: string, length: number): number {
  if (length <= 1) {
    return 0;
  }

  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = ((hash * 33) + seed.charCodeAt(index)) >>> 0;
  }

  return hash % length;
}
