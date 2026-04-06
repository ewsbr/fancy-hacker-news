import type { InjectionKey, Ref } from 'vue';

export const INITIAL_RENDER_PAINTED_KEY: InjectionKey<Ref<boolean>> = Symbol('initial-render-painted');
