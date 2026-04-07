export function waitForAnimationFrame() {
  return new Promise<void>(resolve => {
    requestAnimationFrame(() => resolve());
  });
}

export async function waitForAnimationFrames(count: number) {
  for (let index = 0; index < count; index += 1) {
    await waitForAnimationFrame();
  }
}

export function waitForTimeout(ms: number) {
  return new Promise<void>(resolve => {
    window.setTimeout(resolve, ms);
  });
}

export async function waitForFonts(timeoutMs = 250) {
  if (!('fonts' in document)) {
    return;
  }

  await Promise.race([
    document.fonts.ready,
    waitForTimeout(timeoutMs),
  ]);
}

export async function waitForLayoutToSettle(options?: { frames?: number; fontTimeoutMs?: number }) {
  await waitForAnimationFrames(options?.frames ?? 2);
  await waitForFonts(options?.fontTimeoutMs ?? 250);
}
