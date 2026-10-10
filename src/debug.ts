/* eslint-disable no-console */
type DebugDetails = Record<string, unknown>;

const debugSteps: DebugDetails[] = [];
let lastStepAt = performance.now();

function isDebugMode(): boolean {
  return new URLSearchParams(location.search).get('debug') === '1';
}

export function createLogger(scope: string) {
  const prefix = `[Fancy HN] ${scope}:`;

  return {
    warn: (message: string, ...details: unknown[]) => console.warn(prefix, message, ...details),
    error: (message: string, ...details: unknown[]) => console.error(prefix, message, ...details),
  };
}

/** Record the time since the previous step when `?debug=1` is set. */
export function debugStep(label: string) {
  if (!isDebugMode()) {
    return;
  }

  const now = performance.now();
  debugSteps.push({ label, durationMs: Math.round(now - lastStepAt) });
  lastStepAt = now;
}

export function flushDebugSession(summary: DebugDetails) {
  if (!isDebugMode()) {
    return;
  }

  console.groupCollapsed(`[Fancy HN] debug ${location.pathname}${location.search}`);
  console.table(debugSteps);
  console.info(summary);
  console.groupEnd();
}
