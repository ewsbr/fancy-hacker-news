/**
 * Singleton reactive ref that tracks whether the viewport is "mobile" width.
 * The media query listener is set up once and shared across all consumers,
 * so subscribing from hundreds of CommentNode instances is free.
 */
import { createSharedComposable, useMediaQuery } from '@vueuse/core';

const MOBILE_BREAKPOINT_QUERY = '(max-width: 640px)';
const useSharedIsMobile = createSharedComposable(() => useMediaQuery(MOBILE_BREAKPOINT_QUERY));

export function useIsMobile() {
  return useSharedIsMobile();
}
