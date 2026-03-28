/// <reference types="vite/client" />
/// <reference types="chrome" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}

declare module 'virtual:component-styles' {
  const css: string
  export default css
}
