/**
 * HackerNews Modern UI — background service worker
 *
 * Bare-bones scaffold. Add message handling, storage logic, or
 * network interception here as needed.
 */

import { createLogger } from '../debug';

const backgroundLogger = createLogger('background');

// Log when the extension is installed or updated
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    backgroundLogger.info('Extension installed');
  } else if (reason === 'update') {
    backgroundLogger.info('Extension updated');
  }
});
