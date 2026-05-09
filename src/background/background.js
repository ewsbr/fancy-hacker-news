import { createLogger } from '../debug';

const backgroundLogger = createLogger('background');

// Log when the extension is installed or updated
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    backgroundLogger.info('Extension installed');
  }
  else if (reason === 'update') {
    backgroundLogger.info('Extension updated');
  }
});
