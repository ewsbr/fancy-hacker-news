type DebugDetails = Record<string, unknown>;
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug(message: string, details?: unknown): void;
  info(message: string, details?: unknown): void;
  warn(message: string, details?: unknown): void;
  error(message: string, details?: unknown): void;
  groupCollapsed(message: string, details?: unknown): void;
  groupEnd(): void;
  table(rows: readonly unknown[]): void;
}

interface DebugTimeline {
  step<T>(label: string, fn: () => T, details?: () => DebugDetails): T;
  log(label: string, details?: DebugDetails): void;
}

interface DebugEntry {
  label: string;
  duration: number;
  details?: DebugDetails;
}

interface ObservedPerformanceEntry {
  entryType: string;
  name: string;
  startMs: number;
  durationMs: number;
}

interface DebugWindow extends Window {
  __FANCY_HN_DEBUG_ENTRIES__?: DebugEntry[];
  __FANCY_HN_DEBUG_MEASURE_COUNTER__?: number;
  __FANCY_HN_DEBUG_PERFORMANCE_OBSERVERS__?: PerformanceObserver[];
  __FANCY_HN_OBSERVED_PERFORMANCE_ENTRIES__?: ObservedPerformanceEntry[];
}

const DEBUG_SEARCH_PARAM = 'debug';
const DEBUG_TIMING_PREFIX = 'fancy-hn:';
const LOGGER_STYLES = {
  badge: 'background:#ff6600;color:#2b1707;padding:1px 6px;font-weight:800',
  scope: 'color:#7c2d12;font-weight:700',
  debug: 'color:#64748b;font-weight:700',
  info: 'color:#0f766e;font-weight:700',
  warn: 'color:#b45309;font-weight:700',
  error: 'color:#b91c1c;font-weight:800',
  message: 'color:inherit',
} as const;
const LOG_METHODS: Record<LogLevel, 'debug' | 'info' | 'warn' | 'error'> = {
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
};

function shouldLog(debugOnly: boolean): boolean {
  return !debugOnly || isDebugMode();
}

function formatLogPrefix(scope: string, level: LogLevel, message: string): string[] {
  const normalizedScope = scope.trim().toLowerCase();
  const normalizedLevel = level.toLowerCase();

  if (!normalizedScope || normalizedScope === normalizedLevel) {
    return [
      `%cFancy HN%c ${level.toUpperCase()}%c ${message}`,
      LOGGER_STYLES.badge,
      LOGGER_STYLES[level],
      LOGGER_STYLES.message,
    ];
  }

  return [
    `%cFancy HN%c ${scope}%c ${level.toUpperCase()}%c ${message}`,
    LOGGER_STYLES.badge,
    LOGGER_STYLES.scope,
    LOGGER_STYLES[level],
    LOGGER_STYLES.message,
  ];
}

export function createLogger(scope: string, options?: { debugOnly?: boolean }): Logger {
  const debugOnly = options?.debugOnly ?? false;

  function emit(level: LogLevel, message: string, details?: unknown) {
    if (!shouldLog(debugOnly)) {
      return;
    }

    const method = LOG_METHODS[level];
    const args = formatLogPrefix(scope, level, message);

    if (details === undefined) {
      console[method](...args);
      return;
    }

    console[method](...args, details);
  }

  return {
    debug(message, details) {
      emit('debug', message, details);
    },
    info(message, details) {
      emit('info', message, details);
    },
    warn(message, details) {
      emit('warn', message, details);
    },
    error(message, details) {
      emit('error', message, details);
    },
    groupCollapsed(message, details) {
      if (!shouldLog(debugOnly)) {
        return;
      }

      console.groupCollapsed(...formatLogPrefix(scope, 'debug', message));
      if (details !== undefined) {
        console.info(details);
      }
    },
    groupEnd() {
      if (!shouldLog(debugOnly)) {
        return;
      }

      console.groupEnd();
    },
    table(rows) {
      if (!shouldLog(debugOnly)) {
        return;
      }

      console.table(rows);
    },
  };
}

const debugLogger = createLogger('debug', { debugOnly: true });

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
  currentWindow.__FANCY_HN_DEBUG_ENTRIES__ ||= [];
  return currentWindow.__FANCY_HN_DEBUG_ENTRIES__;
}

function observedPerformanceEntries(): ObservedPerformanceEntry[] {
  const currentWindow = debugWindow();
  currentWindow.__FANCY_HN_OBSERVED_PERFORMANCE_ENTRIES__ ||= [];
  return currentWindow.__FANCY_HN_OBSERVED_PERFORMANCE_ENTRIES__;
}

function disconnectDebugPerformanceObservers() {
  const currentWindow = debugWindow();
  const observers = currentWindow.__FANCY_HN_DEBUG_PERFORMANCE_OBSERVERS__ ?? [];
  observers.forEach(observer => observer.disconnect());
  currentWindow.__FANCY_HN_DEBUG_PERFORMANCE_OBSERVERS__ = [];
}

function ensureDebugPerformanceObservers() {
  if (!isDebugMode() || typeof PerformanceObserver === 'undefined') {
    return;
  }

  const currentWindow = debugWindow();
  if ((currentWindow.__FANCY_HN_DEBUG_PERFORMANCE_OBSERVERS__?.length ?? 0) > 0) {
    return;
  }

  const supportedEntryTypes = PerformanceObserver.supportedEntryTypes ?? [];
  const entryTypes = ['paint', 'longtask'].filter(entryType => supportedEntryTypes.includes(entryType));
  if (entryTypes.length === 0) {
    return;
  }

  const observers: PerformanceObserver[] = [];
  for (const entryType of entryTypes) {
    try {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          observedPerformanceEntries().push({
            entryType: entry.entryType,
            name: entry.name,
            startMs: roundTiming(entry.startTime),
            durationMs: roundTiming(entry.duration),
          });
        }
      });

      observer.observe({ type: entryType, buffered: true } as PerformanceObserverInit);
      observers.push(observer);
    } catch {
      continue;
    }
  }

  currentWindow.__FANCY_HN_DEBUG_PERFORMANCE_OBSERVERS__ = observers;
}

function clearDebugTimingEntries() {
  for (const entry of performance.getEntriesByType('mark')) {
    if (entry.name.startsWith(DEBUG_TIMING_PREFIX)) {
      performance.clearMarks(entry.name);
    }
  }

  for (const entry of performance.getEntriesByType('measure')) {
    if (entry.name.startsWith(DEBUG_TIMING_PREFIX)) {
      performance.clearMeasures(entry.name);
    }
  }
}

function nextDebugMeasureId(): number {
  const currentWindow = debugWindow();
  currentWindow.__FANCY_HN_DEBUG_MEASURE_COUNTER__ = (currentWindow.__FANCY_HN_DEBUG_MEASURE_COUNTER__ ?? 0) + 1;
  return currentWindow.__FANCY_HN_DEBUG_MEASURE_COUNTER__;
}

function roundTiming(value: number): number {
  return Number(value.toFixed(2));
}

function measureName(label: string): string {
  return `${DEBUG_TIMING_PREFIX}${label}`;
}

function recordUserTiming<T>(label: string, fn: () => T): T {
  const id = nextDebugMeasureId();
  const startMark = `${measureName(label)}#${id}:start`;
  const endMark = `${measureName(label)}#${id}:end`;

  performance.mark(startMark);

  try {
    return fn();
  } finally {
    performance.mark(endMark);
    performance.measure(measureName(label), startMark, endMark);
  }
}

function getLatestUserTimingDuration(label: string): number | null {
  const measures = performance.getEntriesByName(measureName(label), 'measure');
  const latestMeasure = measures[measures.length - 1];
  return latestMeasure ? roundTiming(latestMeasure.duration) : null;
}

function getUserTimingRows(): Array<{ label: string; startMs: number; durationMs: number }> {
  return performance
    .getEntriesByType('measure')
    .filter(entry => entry.name.startsWith(DEBUG_TIMING_PREFIX))
    .map(entry => ({
      label: entry.name.slice(DEBUG_TIMING_PREFIX.length),
      startMs: roundTiming(entry.startTime),
      durationMs: roundTiming(entry.duration),
    }))
    .sort((left, right) => left.startMs - right.startMs);
}

function getObservedPerformanceRows(): ObservedPerformanceEntry[] {
  return [...observedPerformanceEntries()].sort((left, right) => left.startMs - right.startMs);
}

function getNavigationTimingSummary(): Record<string, number> | null {
  const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (!navigationEntry) {
    return null;
  }

  return {
    redirectMs: roundTiming(navigationEntry.redirectEnd - navigationEntry.redirectStart),
    responseMs: roundTiming(navigationEntry.responseEnd - navigationEntry.requestStart),
    domInteractiveMs: roundTiming(navigationEntry.domInteractive),
    domContentLoadedMs: roundTiming(navigationEntry.domContentLoadedEventEnd),
    loadEventMs: roundTiming(navigationEntry.loadEventEnd),
  };
}

export function clearDebugEntries() {
  if (!isDebugMode()) {
    return;
  }

  debugWindow().__FANCY_HN_DEBUG_ENTRIES__ = [];
  debugWindow().__FANCY_HN_DEBUG_MEASURE_COUNTER__ = 0;
  debugWindow().__FANCY_HN_OBSERVED_PERFORMANCE_ENTRIES__ = [];
  clearDebugTimingEntries();
  disconnectDebugPerformanceObservers();
  ensureDebugPerformanceObservers();
}

export function debugMeasure<T>(
  label: string,
  fn: () => T,
  details?: () => DebugDetails,
): T {
  if (!isDebugMode()) {
    return fn();
  }

  const result = recordUserTiming(label, fn);
  const duration = getLatestUserTimingDuration(label);

  entries().push({
    label,
    duration: duration ?? 0,
    details: details?.(),
  });

  return result;
}

export function debugLog(label: string, details?: DebugDetails) {
  debugLogger.debug(label, details);
}

export function createDebugTimeline(scope: string): DebugTimeline {
  const normalizedScope = scope.trim();

  function scopedLabel(label: string): string {
    return normalizedScope ? `${normalizedScope}:${label}` : label;
  }

  return {
    step(label, fn, details) {
      return debugMeasure(scopedLabel(label), fn, details);
    },
    log(label, details) {
      debugLog(scopedLabel(label), details);
    },
  };
}

export function flushDebugSession(summary?: DebugDetails) {
  if (!isDebugMode()) {
    return;
  }

  const currentEntries = entries();
  const userTimingRows = getUserTimingRows();
  const observedPerformanceRows = getObservedPerformanceRows();
  const navigationTimingSummary = getNavigationTimingSummary();

  debugLogger.groupCollapsed(`session ${location.pathname}${location.search}`);
  debugLogger.info('step timings');
  debugLogger.table(
    currentEntries.map(entry => ({
      label: entry.label,
      durationMs: roundTiming(entry.duration),
      ...(entry.details ?? {}),
    })),
  );

  if (userTimingRows.length > 0) {
    debugLogger.info('user timing measures');
    debugLogger.table(userTimingRows);
  }

  if (observedPerformanceRows.length > 0) {
    debugLogger.info('observed performance entries');
    debugLogger.table(observedPerformanceRows);
  }

  if (navigationTimingSummary) {
    debugLogger.info('navigation timings', navigationTimingSummary);
  }

  if (summary) {
    debugLogger.info('summary', summary);
  }

  debugLogger.groupEnd();
}