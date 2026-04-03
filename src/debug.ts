type DebugDetails = Record<string, unknown>;

interface DebugEntry {
  label: string;
  duration: number;
  details?: DebugDetails;
}

interface DebugWindow extends Window {
  __REFINED_HN_DEBUG_ENTRIES__?: DebugEntry[];
}

const DEBUG_SEARCH_PARAM = 'debug';

function debugWindow(): DebugWindow {
  return window as DebugWindow;
}

export function isDebugMode(): boolean {
  try {
    const search = new URLSearchParams(location.search);
    return search.get(DEBUG_SEARCH_PARAM) === '1';
  } catch {
    return false;
  }
}

function entries(): DebugEntry[] {
  const currentWindow = debugWindow();
  currentWindow.__REFINED_HN_DEBUG_ENTRIES__ ||= [];
  return currentWindow.__REFINED_HN_DEBUG_ENTRIES__;
}

export function clearDebugEntries() {
  if (!isDebugMode()) {
    return;
  }

  debugWindow().__REFINED_HN_DEBUG_ENTRIES__ = [];
}

export function debugMeasure<T>(
  label: string,
  fn: () => T,
  details?: () => DebugDetails,
): T {
  if (!isDebugMode()) {
    return fn();
  }

  const start = performance.now();

  try {
    return fn();
  } finally {
    entries().push({
      label,
      duration: performance.now() - start,
      details: details?.(),
    });
  }
}

export function debugLog(label: string, details?: DebugDetails) {
  if (!isDebugMode()) {
    return;
  }

  console.debug(`[Refined HN][debug] ${label}`, details ?? '');
}

export function flushDebugSession(summary?: DebugDetails) {
  if (!isDebugMode()) {
    return;
  }

  const currentEntries = entries();
  console.groupCollapsed(`[Refined HN][debug] ${location.pathname}${location.search}`);
  console.table(
    currentEntries.map(entry => ({
      label: entry.label,
      durationMs: Number(entry.duration.toFixed(2)),
      ...(entry.details ?? {}),
    })),
  );

  if (summary) {
    console.log('[Refined HN][debug] summary', summary);
  }

  console.groupEnd();
}