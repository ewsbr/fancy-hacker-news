import type { ParsedRoutePage } from '@/content/route-page';
import type { ParsedHeader } from '@/parsers/header';
import type { CommentNode, ParsedItemPage } from '@/parsers/item';
/**
 * Content script entry point — parse-then-render flow.
 *
 * 1. Snapshot the original page DOM
 * 2. Parse header & resolve route
 * 3. Hide original HN DOM
 * 4. Create root host
 * 5. Mount Vue app with parsed data via provide/inject
 */
import { createApp, reactive, ref } from 'vue';
import { parseRoutePage } from '@/content/route-page';
import { primeExtensionFonts } from '@/content/utils/load-extension-fonts';
import { getLogoForegroundColor } from '@/content/utils/logo-contrast';
import { getLegacySourceAssetNodes } from '@/content/utils/source-assets';
import { ensureResponsiveViewport } from '@/content/utils/viewport';
import { waitForAnimationFrame } from '@/content/utils/wait';
import {
  clearDebugEntries,
  createDebugTimeline,
  createLogger,
  flushDebugSession,
  isDebugMode,
} from '@/debug';
import { parseHeader } from '@/parsers/header';
import { makeNotFoundRoute, resolveRoute } from '@/router';
import { makeItemPageReactive } from '@/state/item-page-state';
import {
  applySettingsToHost,
  loadExtensionSettings,
  makeDefaultSettings,
} from '@/state/settings';
import {
  createExtensionSettingsState,
  EXTENSION_SETTINGS_KEY,
} from '@/state/settings-context';
import {
  BOOTSTRAP_THEME_DATASET_KEY,
  isThemeName,
} from '@/state/theme-metadata';
import App from './App.vue';
import '@/styles/main.scss';

const mainLogger = createLogger('main');

let hideOriginalStyle: HTMLStyleElement | null = null;

function makeReactive<T>(value: T): T {
  if (typeof value === 'object' && value !== null) {
    return reactive(value as object) as T;
  }

  return value;
}

function cleanupOriginalBody(host: HTMLElement) {
  document.body.replaceChildren(host);

  hideOriginalStyle?.remove();
  hideOriginalStyle = null;
}

function makeFallbackSettings() {
  const theme = document.documentElement.dataset[BOOTSTRAP_THEME_DATASET_KEY];

  return makeDefaultSettings({
    systemTheme: isThemeName(theme) ? theme : undefined,
  });
}

async function loadSettingsForMount() {
  try {
    return await loadExtensionSettings();
  } catch (error) {
    if (error instanceof Error) {
      mainLogger.warn('Failed to load settings, using defaults', { error: error.message });
      return makeFallbackSettings();
    }

    throw error;
  }
}

function applyHeaderColorVariables(host: HTMLElement, header: ParsedHeader) {
  if (header.hasCustomTopBarColor) {
    host.style.setProperty('--color-hn-top-bar', header.topBarColor);
    host.style.setProperty('--color-hn-top-bar-contrast', getLogoForegroundColor(header.topBarColor));
    host.setAttribute('data-hn-custom-top-bar', 'true');
  } else {
    host.style.removeProperty('--color-hn-top-bar');
    host.style.removeProperty('--color-hn-top-bar-contrast');
    host.removeAttribute('data-hn-custom-top-bar');
  }
}

function restoreInitialFragment() {
  if (!location.hash) {
    return;
  }

  const host = document.getElementById('fancy-hn-root');
  const target = host?.querySelector<HTMLElement>(`#${CSS.escape(location.hash.slice(1))}`);
  target?.scrollIntoView();
}

function findCommentPath(
  nodes: CommentNode[],
  targetId: string,
  depth = 0,
): Array<{ node: CommentNode; depth: number }> | null {
  for (const node of nodes) {
    if (node.id === targetId) {
      return [{ node, depth }];
    }

    const childPath = findCommentPath(node.children, targetId, depth + 1);
    if (childPath) {
      return [{ node, depth }, ...childPath];
    }
  }

  return null;
}

function prepareInitialItemHashState(pageData: ParsedItemPage) {
  const targetId = location.hash.slice(1);
  if (!targetId) {
    return;
  }

  const path = findCommentPath(pageData.comments, targetId);
  if (!path) {
    return;
  }

  for (const entry of path) {
    entry.node.expandForHash = true;
  }
}

function resetInitialHashScroll() {
  if (!location.hash) {
    return;
  }

  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

function isItemRoutePage(routePage: ParsedRoutePage): routePage is Extract<ParsedRoutePage, { route: { page: 'item' } }> {
  if (routePage.route.page !== 'item') {
    return false;
  }

  return true;
}

// Re-injection guard: when the extension is reloaded while a tab is already open
// (common in Firefox during development), the new content script is injected into
// the already-modified DOM. The original HN nodes have been removed by
// cleanupOriginalBody, so parsing would fail. Detect this by checking for the root
// element we create, and reload the page to restore the clean server-rendered DOM.
async function mountApp() {
  if (document.getElementById('fancy-hn-root')) {
    window.location.reload();
    return;
  }

  try {
    clearDebugEntries();
    const timeline = createDebugTimeline('main');
    const t0 = performance.now();
    const originalBodyChildrenCount = document.body.childElementCount;
    timeline.step('ensure-viewport', () => {
      ensureResponsiveViewport(document);
    });
    // Deliberately captured once at mount. Item pages can render very large
    // comment trees, and we do not want breakpoint changes to invalidate that
    // tree reactively after first render.
    const isMobileLayout = window.matchMedia('(max-width: 640px)').matches;

    // 1. Parse from original DOM before hiding anything
    const header = timeline.step('parse-header', () => parseHeader(document));
    const route = timeline.step('resolve-route', () => {
      const resolved = resolveRoute(location);
      // HN sends HTTP 200 for all missing pages; the body is just "Unknown."
      // Detect this and use a dedicated page rather than falling through to StaticPage.
      if (document.body.textContent?.trim() === 'Unknown.') {
        return makeNotFoundRoute(location);
      }
      return resolved;
    });
    const parsedRoutePage = timeline.step(`parse-page:${route.page}`, () => parseRoutePage(route, document, location));
    const settings = await timeline.stepAsync('load-settings', async () => loadSettingsForMount());

    if (isItemRoutePage(parsedRoutePage)) {
      timeline.step('prepare-item-hash-state', () => {
        prepareInitialItemHashState(parsedRoutePage.pageData);
      });
    }

    const pageData = timeline.step('reactive-page-data', () => {
      if (isItemRoutePage(parsedRoutePage)) {
        return makeItemPageReactive(parsedRoutePage.pageData);
      }

      return makeReactive(parsedRoutePage.pageData);
    });

    await timeline.stepAsync('prime-extension-fonts', async () => {
      await primeExtensionFonts();
    });

    // 2. Hide original HN content with one rule instead of mutating each body child.
    timeline.step('hide-original-dom', () => {
      hideOriginalStyle = document.createElement('style');
      hideOriginalStyle.id = 'fancy-hn-hide-original';
      hideOriginalStyle.textContent = 'body > :not(#fancy-hn-root) { display: none !important; }';
      document.head.appendChild(hideOriginalStyle);
    });

    // 3. Strip HN's source assets so legacy styles and click handlers do not
    // interfere with the extension UI after parse.
    const removedSourceAssetCount = timeline.step('remove-source-assets', () => {
      const sourceNodes = getLegacySourceAssetNodes(document);
      sourceNodes.forEach(el => el.remove());
      return sourceNodes.length;
    }, () => ({ headNodeCount: document.head.childElementCount }));

    // CSS is now injected by the browser via manifest.json

    // Create mount host
    const host = timeline.step('create-host', () => {
      const nextHost = document.createElement('div');
      nextHost.id = 'fancy-hn-root';
      applySettingsToHost(nextHost, settings);
      applyHeaderColorVariables(nextHost, header);
      document.body.appendChild(nextHost);
      return nextHost;
    });

    const mountPoint = host;

    if (route.page === 'item') {
      timeline.step('reset-initial-hash-scroll', () => {
        resetInitialHashScroll();
      });
    }

    // 4. Mount Vue app with parsed data
    // renderTime is a reactive ref so it can be updated after the first visible
    // paint. We provide it before mounting so the component tree has a reference
    // to it, then fill it after two animation frames to ensure the browser has
    // had a chance to paint the mounted UI.
    const renderTime = ref(0);
    const settingsState = createExtensionSettingsState(settings);

    const app = createApp(App);
    app.provide('header', header);
    app.provide('route', route);
    app.provide('originalDoc', document);
    app.provide('pageData', pageData);
    app.provide('pageComponent', parsedRoutePage.component);
    app.provide('isMobileLayout', isMobileLayout);
    app.provide('renderTime', renderTime);
    app.provide(EXTENSION_SETTINGS_KEY, settingsState);
    timeline.step('app-mount', () => {
      app.mount(mountPoint);
    });
    void (async () => {
      await timeline.stepAsync('first-frame-ready', async () => {
        await waitForAnimationFrame();
      });

      timeline.step('restore-initial-fragment', () => {
        // Item pages handle fragment scrolling in CommentsPage.vue (which
        // accounts for modals intercepting deeply nested comments).
        // No other HN page type uses fragment identifiers.
        if (route.page === 'item') {
          return;
        }
        restoreInitialFragment();
      });

      await timeline.stepAsync('first-content-paint', async () => {
        await waitForAnimationFrame();
      }, () => ({
        hostChildCount: host.childElementCount,
        hostTextLength: host.textContent?.trim().length ?? 0,
        renderedCommentNodeCount: host.querySelectorAll('.comment-node').length,
      }));

      const firstContentPaintMs = Math.round(performance.now() - t0);
      renderTime.value = firstContentPaintMs;

      if (isDebugMode()) {
        const itemSummary = isItemRoutePage(parsedRoutePage)
          ? (() => {
              const itemPage = pageData as ParsedItemPage;
              let commentCount = 0;
              let maxDepth = 0;
              const stack = [...itemPage.comments];
              while (stack.length > 0) {
                const node = stack.pop();
                if (!node)
                  continue;
                commentCount += 1;
                maxDepth = Math.max(maxDepth, node.indent);
                stack.push(...node.children);
              }
              return {
                commentCount,
                maxDepth,
                rootComments: itemPage.comments.length,
              };
            })()
          : {};

        timeline.log('mode', {
          enabledBy: new URLSearchParams(location.search).get('debug') === '1' ? 'query' : 'off',
        });
        flushDebugSession({
          route: route.page,
          firstContentPaintMs,
          debugFlushMs: Math.round(performance.now() - t0),
          bodyChildrenBeforeCleanup: originalBodyChildrenCount,
          removedSourceAssetCount,
          isMobileLayout,
          ...itemSummary,
        });
      }

      window.setTimeout(() => {
        timeline.step('cleanup-original-body', () => {
          cleanupOriginalBody(host);
        }, () => ({ removedBodyChildren: originalBodyChildrenCount }));
      }, 0);
    })();
  } catch (e) {
    // On failure, restore original HN page.
    // Remove the hide rule so the original DOM becomes visible again.
    mainLogger.error('Failed to render', e);
    document.getElementById('fancy-hn-hide-original')?.remove();
    hideOriginalStyle = null;
  }
}

void mountApp();
