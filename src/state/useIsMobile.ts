/**
 * Singleton reactive ref that tracks whether the viewport is "mobile" width.
 * The media query listener is set up once and shared across all consumers,
 * so subscribing from hundreds of CommentNode instances is free.
 */
import { ref } from 'vue';

const mq = window.matchMedia('(max-width: 640px)');
const isMobile = ref(mq.matches);

mq.addEventListener('change', (e) => {
  isMobile.value = e.matches;
});

export function useIsMobile() {
  return isMobile;
}
