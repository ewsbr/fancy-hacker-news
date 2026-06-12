<script setup lang="ts">
import { useEventListener } from '@vueuse/core';
import { ArrowBigDownDash, ArrowBigUpDash } from 'lucide-vue-next';
import { computed, onMounted, ref, shallowRef } from 'vue';

const SHOW_AFTER_SCROLL_TOP = 280;

const scrollContainer = shallowRef<HTMLElement | null>(null);
const currentScrollTop = ref(0);
const savedReturnScrollTop = ref<number | null>(null);
const restoreArmed = ref(false);

const buttonMode = computed<'top' | 'restore' | null>(() => {
  if (savedReturnScrollTop.value != null && restoreArmed.value) {
    return 'restore';
  }

  if (currentScrollTop.value > SHOW_AFTER_SCROLL_TOP) {
    return 'top';
  }

  return null;
});
const buttonLabel = computed(() => (
  buttonMode.value === 'restore'
    ? 'Return to previous position'
    : 'Scroll to top'
));

function syncScrollState() {
  const nextScrollTop = scrollContainer.value?.scrollTop ?? 0;
  currentScrollTop.value = nextScrollTop;

  if (savedReturnScrollTop.value == null) {
    return;
  }

  if (restoreArmed.value && nextScrollTop > SHOW_AFTER_SCROLL_TOP) {
    savedReturnScrollTop.value = null;
    restoreArmed.value = false;
    return;
  }

  if (nextScrollTop <= SHOW_AFTER_SCROLL_TOP) {
    restoreArmed.value = true;
  }
}

function scrollToTop() {
  const nextReturnScrollTop = scrollContainer.value?.scrollTop ?? 0;

  if (nextReturnScrollTop > SHOW_AFTER_SCROLL_TOP) {
    savedReturnScrollTop.value = nextReturnScrollTop;
  }

  restoreArmed.value = false;
  scrollContainer.value?.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth',
  });
}

function returnToSavedPosition() {
  const nextScrollTop = savedReturnScrollTop.value;

  if (nextScrollTop == null) {
    return;
  }

  savedReturnScrollTop.value = null;
  restoreArmed.value = false;
  scrollContainer.value?.scrollTo({
    top: nextScrollTop,
    left: 0,
    behavior: 'smooth',
  });
}

function handleButtonClick() {
  if (buttonMode.value === 'restore') {
    returnToSavedPosition();
    return;
  }

  scrollToTop();
}

onMounted(() => {
  scrollContainer.value = document.getElementById('fancy-hn-root');
  syncScrollState();
});

useEventListener(scrollContainer, 'scroll', syncScrollState, { passive: true });
</script>

<template>
  <Transition name="scroll-to-top">
    <button
      v-if="buttonMode != null"
      type="button"
      class="scroll-to-top"
      :aria-label="buttonLabel"
      :title="buttonLabel"
      @click="handleButtonClick"
    >
      <ArrowBigDownDash v-if="buttonMode === 'restore'" :size="28" aria-hidden="true" />
      <ArrowBigUpDash v-else :size="28" aria-hidden="true" />
    </button>
  </Transition>
</template>

<style scoped lang="scss">
.scroll-to-top {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 120;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 0;
  padding: 0;
  background: transparent;
  box-shadow: none;
  color: #ffffff;
  cursor: pointer;
  mix-blend-mode: difference;
  transition: transform 0.18s ease, opacity 0.18s ease;
  opacity: 0.92;

  &:hover {
    transform: translateY(-2px);
    opacity: 1;
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 3px;
  }

  @media (max-width: 640px) {
    right: 14px;
    bottom: 14px;
    width: 32px;
    height: 32px;
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
