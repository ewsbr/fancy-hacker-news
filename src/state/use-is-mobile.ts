/**
 * Singleton reactive ref that tracks whether the viewport is "mobile" width.
 * The media query listener is set up once and shared across all consumers,
 * so subscribing from hundreds of CommentNode instances is free.
 */
import { ref } from 'vue';

const MOBILE_BREAKPOINT_QUERY = '(max-width: 640px)';
const isMobile = ref(false);
let isTrackingViewport = false;

function startTrackingViewport() {
  if (isTrackingViewport || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return;
  }

  const mediaQueryList = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
  isMobile.value = mediaQueryList.matches;

  const updateMobileState = (event: MediaQueryListEvent) => {
    isMobile.value = event.matches;
  };

  mediaQueryList.addEventListener('change', updateMobileState);

  isTrackingViewport = true;
}

export function useIsMobile() {
  startTrackingViewport();
  return isMobile;
}
