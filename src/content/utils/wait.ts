export function waitForAnimationFrame() {
  return new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
}

export async function waitForAnimationFrames(count: number) {
  for (let index = 0; index < count; index += 1) {
    await waitForAnimationFrame();
  }
}

/** Two frames plus web fonts (bounded at 250ms) let layout-affecting work land. */
export async function waitForLayoutToSettle() {
  await waitForAnimationFrames(2);
  await Promise.race([
    document.fonts.ready,
    new Promise(resolve => window.setTimeout(resolve, 250)),
  ]);
}
