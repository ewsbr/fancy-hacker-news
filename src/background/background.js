/**
 * HackerNews Modern UI — background service worker
 *
 * Bare-bones scaffold. Add message handling, storage logic, or
 * network interception here as needed.
 */

// Log when the extension is installed or updated
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    console.log('[Refined HN] Extension installed.');
  } else if (reason === 'update') {
    console.log('[Refined HN] Extension updated.');
  }
});
