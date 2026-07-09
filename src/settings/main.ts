import { createApp } from 'vue';
import { loadExtensionFonts } from '@/content/utils/load-extension-fonts';
import {
  applySettingsToHost,
  makeDefaultSettings,
} from '@/state/settings';
import {
  createExtensionSettingsState,
  EXTENSION_SETTINGS_KEY,
} from '@/state/settings-context';
import SettingsApp from './SettingsApp.vue';

loadExtensionFonts();

const host = document.getElementById('fancy-hn-root');
if (!(host instanceof HTMLElement)) {
  throw new TypeError('Expected #fancy-hn-root to exist before mounting settings.');
}

const settings = createExtensionSettingsState(makeDefaultSettings());
applySettingsToHost(host, settings);

createApp(SettingsApp)
  .provide(EXTENSION_SETTINGS_KEY, settings)
  .mount(host);
