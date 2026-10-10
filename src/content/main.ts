/**
 * Content script entry point: parse the original HN DOM, hide it, then mount
 * the Vue app with the parsed data.
 */
import type { CommentNode, ParsedItemPage } from '@/parsers/item';
import type { RouteDescriptor } from '@/router';
import { createApp, reactive, ref } from 'vue';
import { parseRoutePage } from '@/content/route-page';
import { primeExtensionFonts } from '@/content/utils/load-extension-fonts';
import { getLogoForegroundColor } from '@/content/utils/logo-contrast';
import { EXTENSION_ROOT_ID } from '@/content/utils/root-host';
import { getLegacySourceAssetNodes } from '@/content/utils/source-assets';
import { ensureResponsiveViewport } from '@/content/utils/viewport';
import { waitForAnimationFrame } from '@/content/utils/wait';
import { createLogger, debugStep, flushDebugSession } from '@/debug';
import { parseHeader } from '@/parsers/header';
import { resolveRoute } from '@/router';
import { detachDeferredCommentRows, findCommentPath, makeItemPageReactive } from '@/state/item-page-state';
import { applySettingsToHost, loadExtensionSettings, makeDefaultSettings } from '@/state/settings';
import { EXTENSION_SETTINGS_KEY } from '@/state/settings-context';
import { BOOTSTRAP_THEME_DATASET_KEY, isThemeName } from '@/state/theme-metadata';
import App from './App.vue';
import '@/styles/main.scss';

const logger = createLogger('main');
const HIDE_ORIGINAL_STYLE_ID = 'fancy-hn-hide-original';

async function loadSettingsForMount() {
  try {
    return await loadExtensionSettings();
  } catch (error) {
    logger.warn('Failed to load settings, using defaults', error);
    const theme = document.documentElement.dataset[BOOTSTRAP_THEME_DATASET_KEY];
    return makeDefaultSettings({ systemTheme: isThemeName(theme) ? theme : undefined });
  }
}

function resolveCurrentRoute(): RouteDescriptor {
  // HN sends HTTP 200 for missing pages with a bare "Unknown." body.
  if (!document.getElementById('hnmain') && document.body.textContent?.trim() === 'Unknown.') {
    return { page: 'notfound', params: {} };
  }

  return resolveRoute(location);
}

function countComments(nodes: CommentNode[]): number {
  return nodes.reduce((total, node) => total + 1 + countComments(node.children), 0);
}

// Re-injection guard: when the extension is reloaded while a tab is already open
// (common in Firefox during development), the new content script runs against
// the already-replaced DOM. Reload to restore the server-rendered page.
async function mountApp() {
  if (document.getElementById(EXTENSION_ROOT_ID)) {
    location.reload();
    return;
  }

  try {
    const t0 = performance.now();
    // Extension storage I/O can run while we parse the source DOM.
    const settingsReady = loadSettingsForMount();
    ensureResponsiveViewport(document);
    // Deliberately captured once at mount. Item pages can render very large
    // comment trees, and we do not want breakpoint changes to invalidate that
    // tree reactively after first render.
    const isMobileLayout = window.matchMedia('(max-width: 640px)').matches;

    // 1. Parse from original DOM before hiding anything.
    const header = parseHeader(document);
    const route = resolveCurrentRoute();
    const parsedPage = parseRoutePage(route, document, location);
    debugStep(`parse:${route.page}`);

    const itemPage = route.page === 'item' ? parsedPage.pageData as ParsedItemPage : null;
    for (const node of (itemPage && findCommentPath(itemPage.comments, location.hash.slice(1))) ?? []) {
      node.expandForHash = true;
    }
    const pageData = itemPage
      ? makeItemPageReactive(itemPage)
      : parsedPage.pageData && reactive(parsedPage.pageData);

    const settings = await settingsReady;
    await primeExtensionFonts();
    debugStep('settings-and-fonts');

    // 2. Hide original HN content and strip its assets so legacy styles and
    // handlers do not interfere with the extension UI.
    const hideOriginalStyle = document.createElement('style');
    hideOriginalStyle.id = HIDE_ORIGINAL_STYLE_ID;
    hideOriginalStyle.textContent = `body > :not(#${EXTENSION_ROOT_ID}) { display: none !important; }`;
    document.head.appendChild(hideOriginalStyle);
    getLegacySourceAssetNodes(document).forEach(el => el.remove());

    // 3. Create the mount host.
    const host = document.createElement('div');
    host.id = EXTENSION_ROOT_ID;
    applySettingsToHost(host, settings);
    if (header.hasCustomTopBarColor) {
      host.style.setProperty('--color-hn-top-bar', header.topBarColor);
      host.style.setProperty('--color-hn-top-bar-contrast', getLogoForegroundColor(header.topBarColor));
      host.setAttribute('data-hn-custom-top-bar', 'true');
    }
    document.body.appendChild(host);

    // 4. Mount. renderTime is filled after the first painted frames.
    const renderTime = ref(0);
    const app = createApp(App);
    app.provide('header', header);
    app.provide('route', route);
    app.provide('pageData', pageData);
    app.provide('pageComponent', parsedPage.component);
    app.provide('isMobileLayout', isMobileLayout);
    app.provide('renderTime', renderTime);
    app.provide(EXTENSION_SETTINGS_KEY, reactive(settings));
    app.mount(host);
    debugStep('mount');

    await waitForAnimationFrame();
    // Item pages scroll to fragments in CommentsPage.vue, which accounts for
    // modals intercepting deeply nested comments.
    if (route.page !== 'item' && location.hash) {
      host.querySelector(`#${CSS.escape(location.hash.slice(1))}`)?.scrollIntoView();
    }
    await waitForAnimationFrame();
    renderTime.value = Math.round(performance.now() - t0);
    debugStep('first-content-paint');
    flushDebugSession({
      route: route.page,
      firstContentPaintMs: renderTime.value,
      isMobileLayout,
      ...(itemPage && { commentCount: countComments(itemPage.comments) }),
    });

    window.setTimeout(() => {
      document.body.replaceChildren(host);
      hideOriginalStyle.remove();
      if (itemPage) {
        detachDeferredCommentRows(itemPage);
      }
    }, 0);
  } catch (error) {
    // On failure, restore the original HN page. Both the bootstrap style and a
    // partially mounted host can obscure it.
    logger.error('Failed to render', error);
    document.getElementById(EXTENSION_ROOT_ID)?.remove();
    document.getElementById('hn-anti-fouc')?.remove();
    document.getElementById(HIDE_ORIGINAL_STYLE_ID)?.remove();
  }
}

void mountApp();
