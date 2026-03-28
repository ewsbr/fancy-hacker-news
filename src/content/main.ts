/**
 * Content script entry point — parse-then-render flow.
 *
 * 1. Snapshot the original page DOM
 * 2. Parse header & resolve route
 * 3. Hide original HN DOM
 * 4. Create shadow DOM host
 * 5. Mount Vue app with parsed data via provide/inject
 */
import { createApp } from 'vue';
import { resolveRoute } from '@/router';
import { parseHeader } from '@/parsers/header';
import { parseLoginPage } from '@/parsers/login';
import { parseStaticPage } from '@/parsers/static';
import { parseStoryList } from '@/parsers/storyList';
import { parseItemPage } from '@/parsers/item';
import App from './App.vue';
import mainCss from '@/styles/main.scss?inline';
import componentCss from 'virtual:component-styles';

function parsePageData(page: string, doc: Document): unknown {
  if (page === 'login') return parseLoginPage(doc);
  if (page === 'stories') return parseStoryList(doc);
  if (page === 'item') return parseItemPage(doc);
  // Everything else (explicit 'static' + catch-all routes) falls back to StaticPage —
  // parse the content so the component always receives a valid ParsedStaticPage.
  return parseStaticPage(doc);
}

try {
  const t0 = performance.now();

  // 1. Parse from original DOM before hiding anything
  const header = parseHeader(document);
  const route = resolveRoute(location);
  const pageData = parsePageData(route.page, document);

  // 2. Hide original HN content
  for (const child of Array.from(document.body.children)) {
    (child as HTMLElement).style.display = 'none';
  }

  // 3. Create shadow DOM host
  const host = document.createElement('div');
  host.id = 'hn-modern-root';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  // Inject styles into shadow root
  const style = document.createElement('style');
  style.textContent = [mainCss, componentCss].filter(Boolean).join('\n');
  shadow.appendChild(style);

  const mountPoint = document.createElement('div');
  shadow.appendChild(mountPoint);

  // 4. Mount Vue app with parsed data
  const renderTime = Math.round(performance.now() - t0);

  const app = createApp(App);
  app.provide('header', header);
  app.provide('route', route);
  app.provide('originalDoc', document);
  app.provide('pageData', pageData);
  app.provide('renderTime', renderTime);
  app.mount(mountPoint);
} catch (e) {
  // On failure, restore original HN page.
  // Explicitly set display:block to override the fouc.css rule (body > center { display:none }).
  console.error('[HN Modern] Failed to render:', e);
  for (const child of Array.from(document.body.children)) {
    (child as HTMLElement).style.display = 'block';
  }
}
