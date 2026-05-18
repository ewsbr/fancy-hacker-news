/// <reference types="vite/client" />
/// <reference types="chrome" />
/// <reference types="unplugin-icons/types/vue3" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent;
  export default component;
}

declare module '@fontsource-variable/*';
