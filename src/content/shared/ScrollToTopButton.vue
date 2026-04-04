<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { ArrowBigUpDash } from 'lucide-vue-next';

const isVisible = ref(false);
const SHOW_AFTER_SCROLL_TOP = 280;

let scrollContainer: HTMLElement | null = null;

function syncVisibility() {
  isVisible.value = (scrollContainer?.scrollTop ?? 0) > SHOW_AFTER_SCROLL_TOP;
}

function scrollToTop() {
  scrollContainer?.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth',
  });
}

onMounted(() => {
  scrollContainer = document.getElementById('fancy-hn-root');
  syncVisibility();
  scrollContainer?.addEventListener('scroll', syncVisibility, { passive: true });
});

onUnmounted(() => {
  scrollContainer?.removeEventListener('scroll', syncVisibility);
});
</script>

<template>
  <Transition name="scroll-to-top">
    <button
      v-if="isVisible"
      type="button"
      class="scroll-to-top"
      aria-label="Scroll to top"
      title="Scroll to top"
      @click="scrollToTop"
    >
      <ArrowBigUpDash :size="28" aria-hidden="true" />
    </button>
  </Transition>
</template>

<style scoped lang="scss">
.scroll-to-top {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 120;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 0;
  padding: 0;
  background: transparent;
  box-shadow: none;
  color: color-mix(in srgb, var(--color-text) 84%, transparent);
  cursor: pointer;
  transition: transform 0.18s ease, color 0.18s ease, opacity 0.18s ease;
  opacity: 0.82;

  &:hover {
    transform: translateY(-2px);
    color: var(--color-accent);
    opacity: 1;
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 3px;
  }

  @media (max-width: 640px) {
    right: 0.85rem;
    bottom: 0.85rem;
    width: 2rem;
    height: 2rem;
  }
}

.scroll-to-top-enter-active,
.scroll-to-top-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.scroll-to-top-enter-from,
.scroll-to-top-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
