import { createApp, reactive } from 'vue';
import { loadExtensionFonts } from '@/content/utils/load-extension-fonts';
import { getExtensionRootHost } from '@/content/utils/root-host';
import { applySettingsToHost, loadExtensionSettings, makeDefaultSettings } from '@/state/settings';
import { EXTENSION_SETTINGS_KEY } from '@/state/settings-context';
import SettingsApp from './SettingsApp.vue';

loadExtensionFonts();

const host = getExtensionRootHost()!;
let loadError: string | null = null;

void loadExtensionSettings()
  .catch((error: Error) => {
    loadError = error.message;
    return makeDefaultSettings();
  })
  .then((storedSettings) => {
    const settings = reactive(storedSettings);
    applySettingsToHost(host, settings);
    createApp(SettingsApp, { loadError })
      .provide(EXTENSION_SETTINGS_KEY, settings)
      .mount(host);
  });
