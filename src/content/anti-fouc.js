// Runs at document_start — before any HTML has been parsed or painted.
// Injects a CSS rule that hides HN's <center> wrapper so the original page
// is never visible. The main content script (document_end) will create the
// shadow DOM and mount Vue on top. The error handler in main.ts explicitly
// sets display:block to override this rule if the extension fails.
document.documentElement.appendChild(
  Object.assign(document.createElement('style'), {
    id: 'hn-anti-fouc',
    textContent: 'body>center{display:none!important}',
  }),
);
