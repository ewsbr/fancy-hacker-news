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
import {
  clearDebugEntries,
  createDebugTimeline,
  createLogger,
  flushDebugSession,
  isDebugMode,
} from '@/debug';
import { resolveRoute } from '@/router';
import { parseHeader } from '@/parsers/header';
import { parseLoginPage } from '@/parsers/login';
import { parseStaticPage } from '@/parsers/static';
import { parseStoryList } from '@/parsers/storyList';
import { parseItemPage, type CommentNode, type ParsedItemPage } from '@/parsers/item';
import { parseUserPage } from '@/parsers/user';
import { parseThreadsPage } from '@/parsers/threads';
import { parseNewComments } from '@/parsers/newComments';
import { parseSubmitPage } from '@/parsers/submit';
import { parseReplyPage } from '@/parsers/reply';
import { parseLeadersPage } from '@/parsers/leaders';
import { parseDeleteConfirmPage } from '@/parsers/deleteConfirm';
import { parseListsPage } from '@/parsers/lists';
import { parseTopColorsPage } from '@/parsers/topColors';
import App from './App.vue';
import '@/styles/main.scss';

const mainLogger = createLogger('main');
const BOOTSTRAP_THEME_DATASET_KEY = 'fancyHnTheme';

function parsePageData(page: string, doc: Document): unknown {
  if (page === 'login') return parseLoginPage(doc);
  if (page === 'stories') return parseStoryList(doc);
  if (page === 'item') return parseItemPage(doc);
  if (page === 'user') return parseUserPage(doc);
  if (page === 'threads') return parseThreadsPage(doc);
  if (page === 'newcomments') return parseNewComments(doc);
  if (page === 'favorites' || page === 'upvoted') {
    const isComments = new URLSearchParams(location.search).get('comments') === 't';
    return isComments ? parseNewComments(doc) : parseStoryList(doc);
  }
  if (page === 'submitted' || page === 'hidden') return parseStoryList(doc);
  if (page === 'submit') {
    const submitPage = parseSubmitPage(doc);
    return submitPage.form ? submitPage : parseLoginPage(doc);
  }
  if (page === 'reply') return parseReplyPage(doc);
  if (page === 'formatdoc') return parseStaticPage(doc);
  if (page === 'leaders') return parseLeadersPage(doc);
  if (page === 'delete-confirm') return parseDeleteConfirmPage(doc);
  if (page === 'lists') return parseListsPage(doc);
  if (page === 'topcolors') return parseTopColorsPage(doc);
  // Everything else (explicit 'static' + catch-all routes) falls back to StaticPage —
  // parse the content so the component always receives a valid ParsedStaticPage.
  return parseStaticPage(doc);
}

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

function applyBootstrappedTheme(host: HTMLElement) {
  const theme = document.documentElement.dataset[BOOTSTRAP_THEME_DATASET_KEY];
  if (!theme || theme === 'light') {
    host.removeAttribute('data-theme');
    return;
  }

  host.setAttribute('data-theme', theme);
}

function isolateFromLegacyClickHandlers(host: HTMLElement) {
  host.addEventListener('click', event => {
    event.stopPropagation();
  });
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

// Re-injection guard: when the extension is reloaded while a tab is already open
// (common in Firefox during development), the new content script is injected into
// the already-modified DOM. The original HN nodes have been removed by
// cleanupOriginalBody, so parsing would fail. Detect this by checking for the root
// element we create, and reload the page to restore the clean server-rendered DOM.
function mountApp() {
  if (document.getElementById('fancy-hn-root')) {
    window.location.reload();
    return;
  }

  try {
    clearDebugEntries();
    const timeline = createDebugTimeline('main');
    const t0 = performance.now();
    const originalBodyChildrenCount = document.body.childElementCount;
    const isMobileLayout = window.matchMedia('(max-width: 640px)').matches;
  
    // 1. Parse from original DOM before hiding anything
    const header = timeline.step('parse-header', () => parseHeader(document));
    const route = timeline.step('resolve-route', () => resolveRoute(location));
    const pageData = timeline.step(`parse-page:${route.page}`, () => makeReactive(parsePageData(route.page, document)));
  
    if (route.page === 'item') {
      timeline.step('prepare-item-hash-state', () => {
        prepareInitialItemHashState(pageData as ParsedItemPage);
      });
    }
  
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
      const sourceNodes = Array.from(document.querySelectorAll('link[rel="stylesheet"], style:not(#hn-anti-fouc), script'));
      sourceNodes.forEach(el => el.remove());
      return sourceNodes.length;
    }, () => ({ headNodeCount: document.head.childElementCount }));
  
    // CSS is now injected by the browser via manifest.json
  
    // Create mount host
    const host = timeline.step('create-host', () => {
      const nextHost = document.createElement('div');
      nextHost.id = 'fancy-hn-root';
      applyBootstrappedTheme(nextHost);
      isolateFromLegacyClickHandlers(nextHost);
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
    // renderTime is a reactive ref so it can be updated after the first paint.
    // We provide it before mounting so the component tree has a reference to it,
    // then update the value after the first requestAnimationFrame — which fires
    // just before the browser paints — giving us a true end-to-end elapsed time.
    const renderTime = ref(0);
  
    const app = createApp(App);
    app.provide('header', header);
    app.provide('route', route);
    app.provide('originalDoc', document);
    app.provide('pageData', pageData);
    app.provide('isMobileLayout', isMobileLayout);
    app.provide('renderTime', renderTime);
    timeline.step('app-mount', () => {
      app.mount(mountPoint);
    });
    requestAnimationFrame(() => {
      timeline.step('restore-initial-fragment', () => {
        // Item pages handle fragment scrolling in CommentsPage.vue (which
        // accounts for modals intercepting deeply nested comments).
        // No other HN page type uses fragment identifiers.
        if (route.page === 'item') {
          return;
        }
        restoreInitialFragment();
      });
      renderTime.value = Math.round(performance.now() - t0);
  
      if (isDebugMode()) {
        const itemSummary = route.page === 'item'
          ? (() => {
              const itemPage = pageData as ParsedItemPage;
              let commentCount = 0;
              let maxDepth = 0;
              const stack = [...itemPage.comments];
              while (stack.length > 0) {
                const node = stack.pop();
                if (!node) continue;
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
          totalRenderMs: Math.round(performance.now() - t0),
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
    });
  } catch (e) {
    // On failure, restore original HN page.
    // Remove the hide rule so the original DOM becomes visible again.
    mainLogger.error('Failed to render', e);
    document.getElementById('fancy-hn-hide-original')?.remove();
    hideOriginalStyle = null;
  }
}

mountApp();
