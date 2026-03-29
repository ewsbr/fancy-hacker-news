/**
 * Content script entry point — parse-then-render flow.
 *
 * 1. Snapshot the original page DOM
 * 2. Parse header & resolve route
 * 3. Hide original HN DOM
 * 4. Create root host
 * 5. Mount Vue app with parsed data via provide/inject
 */
import { createApp, ref } from 'vue';
import { resolveRoute } from '@/router';
import { parseHeader } from '@/parsers/header';
import { parseLoginPage } from '@/parsers/login';
import { parseStaticPage } from '@/parsers/static';
import { parseStoryList } from '@/parsers/storyList';
import { parseItemPage } from '@/parsers/item';
import { parseUserPage } from '@/parsers/user';
import { parseThreadsPage } from '@/parsers/threads';
import { parseNewComments } from '@/parsers/newComments';
import { parseSubmitPage } from '@/parsers/submit';
import { parseReplyPage } from '@/parsers/reply';
import App from './App.vue';
import mainCss from '@/styles/main.scss?inline';
import componentCss from 'virtual:component-styles';

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
  if (page === 'submit') return parseSubmitPage(doc);
  if (page === 'reply') return parseReplyPage(doc);
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

  // Strip IDs from hidden HN elements to prevent fragment navigation conflicts.
  // HN comment <tr>s use the same numeric IDs as our Vue-rendered comment nodes;
  // document.getElementById and native hash navigation would find the hidden HN
  // element first without this step.
  // Single querySelectorAll over the whole body is far faster than a per-child
  // nested loop on pages with 500+ comment rows.
  document.body
    .querySelectorAll('[id]:not(#hn-anti-fouc)')
    .forEach(el => el.removeAttribute('id'));

  // 3. Strip HN's stylesheets to prevent bleed-in
  document.querySelectorAll('link[rel="stylesheet"], style:not(#hn-anti-fouc)').forEach(el => el.remove());

  // Inject styles into document.head
  const style = document.createElement('style');
  style.textContent = [mainCss, componentCss].filter(Boolean).join('\n');
  document.head.appendChild(style);

  // Create mount host
  const host = document.createElement('div');
  host.id = 'hn-modern-root';
  document.body.appendChild(host);

  const mountPoint = host;

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
  app.provide('renderTime', renderTime);
  app.mount(mountPoint);

  requestAnimationFrame(() => {
    renderTime.value = Math.round(performance.now() - t0);
  });
} catch (e) {
  // On failure, restore original HN page.
  // Explicitly set display:block to override the fouc.css rule (body > center { display:none }).
  console.error('[HN Modern] Failed to render:', e);
  for (const child of Array.from(document.body.children)) {
    (child as HTMLElement).style.display = 'block';
  }
}
