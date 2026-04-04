<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import type { CommentNode as CommentNodeType } from '@/parsers/item';
import CommentNode from './CommentNode.vue';
import { X } from 'lucide-vue-next';

const props = defineProps<{
  node: CommentNodeType;
  scrollToId?: string | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const bodyRef = ref<HTMLElement | null>(null);

async function scrollToTargetComment(targetId: string) {
  await nextTick();
  await new Promise(resolve => requestAnimationFrame(() => resolve(null)));
  await new Promise(resolve => requestAnimationFrame(() => resolve(null)));

  const target = bodyRef.value?.querySelector<HTMLElement>(`#${CSS.escape(targetId)}`) ?? null;
  if (!target) {
    return;
  }

  const header = target.querySelector<HTMLElement>('.comment-node__header') ?? target;
  header.scrollIntoView({ block: 'start' });
}

function onOverlayClick(e: MouseEvent) {
  // Stop propagation to prevent HN's hn.js handlers from receiving click events
  // on SVG elements (lucide icons), which crash because SVGAnimatedString has no .split().
  e.stopPropagation();
  if (e.target === e.currentTarget) {
    emit('close');
  }
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close');
}

onMounted(async () => {
  document.addEventListener('keydown', onKeyDown);

  if (props.scrollToId) {
    await scrollToTargetComment(props.scrollToId);
  }
});

watch(
  () => props.scrollToId,
  async scrollToId => {
    if (!scrollToId) {
      return;
    }

    await scrollToTargetComment(scrollToId);
  },
  { flush: 'post' },
);

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown);
});
</script>

<template>
  <Teleport to="#fancy-hn-root">
    <div class="sub-thread-modal" @click="onOverlayClick" role="dialog" aria-modal="true">
      <div class="sub-thread-modal__panel">
        <div class="sub-thread-modal__header">
          <span class="sub-thread-modal__title">
            Thread by <strong>{{ node.author }}</strong>
          </span>
          <button class="sub-thread-modal__close" @click="emit('close')" aria-label="Close thread">
            <X :size="18" />
          </button>
        </div>
        <div class="sub-thread-modal__body" ref="bodyRef">
          <CommentNode :node="node" :depth="0" :in-modal="true" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.sub-thread-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  touch-action: none;

  @media (min-width: 641px) {
    align-items: center;
    justify-content: center;
  }

  &__panel {
    background: var(--color-surface);
    width: 100%;
    max-height: 90dvh;
    display: flex;
    flex-direction: column;
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.25);
    overflow: hidden;

    @media (min-width: 641px) {
      width: min(680px, 95vw);
      max-height: 80dvh;
      border-radius: 12px;
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3);
    }
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.9rem 1rem 0.75rem;
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
    font-family: var(--font-title);
  }

  &__title {
    font-size: 0.9rem;
    color: var(--color-text-muted);

    strong {
      color: var(--color-text);
      font-weight: 700;
    }
  }

  &__close {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text-muted);
    padding: 0.25rem;
    display: flex;
    border-radius: 6px;
    transition: color 0.15s, background 0.15s;

    &:hover {
      color: var(--color-text);
      background: var(--color-border);
    }
  }

  &__body {
    overflow-y: auto;
    padding: 1rem;
    flex: 1;
    touch-action: pan-y;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }
}
</style>
