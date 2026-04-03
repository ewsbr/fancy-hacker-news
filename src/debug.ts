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

interface DebugEntry {
  label: string;
  duration: number;
  details?: DebugDetails;
}

interface DebugWindow extends Window {
  __REFINED_HN_DEBUG_ENTRIES__?: DebugEntry[];
}

const DEBUG_SEARCH_PARAM = 'debug';
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
      `%cRefined HN%c ${level.toUpperCase()}%c ${message}`,
      LOGGER_STYLES.badge,
      LOGGER_STYLES[level],
      LOGGER_STYLES.message,
    ];
  }

  return [
    `%cRefined HN%c ${scope}%c ${level.toUpperCase()}%c ${message}`,
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
  debugLogger.debug(label, details);
}

export function flushDebugSession(summary?: DebugDetails) {
  if (!isDebugMode()) {
    return;
  }

  const currentEntries = entries();
  debugLogger.groupCollapsed(`session ${location.pathname}${location.search}`);
  debugLogger.table(
    currentEntries.map(entry => ({
      label: entry.label,
      durationMs: Number(entry.duration.toFixed(2)),
      ...(entry.details ?? {}),
    })),
  );

  if (summary) {
    debugLogger.info('summary', summary);
  }

  debugLogger.groupEnd();
}