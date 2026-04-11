<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui';
import type { CommentNode as CommentNodeType } from '@/parsers/item';
import CommentNode from './CommentNode.vue';
import { X } from 'lucide-vue-next';
import { waitForAnimationFrames } from '@/content/utils/wait';
import { EXTENSION_ROOT_SELECTOR } from '@/content/utils/root-host';

const props = defineProps<{
  node: CommentNodeType;
  scrollToId?: string | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const bodyRef = ref<HTMLElement | null>(null);
const closeButtonRef = ref<HTMLButtonElement | null>(null);

async function scrollToTargetComment(targetId: string) {
  await nextTick();
  await waitForAnimationFrames(2);

  const target = bodyRef.value?.querySelector<HTMLElement>(`#${CSS.escape(targetId)}`) ?? null;
  if (!target) {
    return;
  }

  const header = target.querySelector<HTMLElement>('.comment-node__header') ?? target;
  header.scrollIntoView({ block: 'start' });
}

function onOpenChange(open: boolean) {
  if (!open) {
    emit('close');
  }
}

function onOpenAutoFocus(event: Event) {
  event.preventDefault();
  closeButtonRef.value?.focus({ preventScroll: true });
}

watch(
  () => props.node.id,
  async () => {
    if (props.scrollToId) {
      await scrollToTargetComment(props.scrollToId);
    }
  },
  { immediate: true },
);

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
</script>

<template>
  <DialogRoot :open="true" @update:open="onOpenChange">
    <DialogPortal defer :to="EXTENSION_ROOT_SELECTOR">
      <DialogOverlay class="sub-thread-modal" @click.stop>
        <DialogContent
          class="sub-thread-modal__panel"
          aria-describedby="undefined"
          @click.stop
          @open-auto-focus="onOpenAutoFocus"
        >
          <div class="sub-thread-modal__header">
            <DialogTitle as="span" class="sub-thread-modal__title">
              Thread by <strong>{{ node.author }}</strong>
            </DialogTitle>
            <DialogClose as-child>
              <button ref="closeButtonRef" class="sub-thread-modal__close" aria-label="Close thread">
                <X :size="18" />
              </button>
            </DialogClose>
          </div>
          <div class="sub-thread-modal__body" ref="bodyRef">
            <CommentNode :node="node" :depth="0" :in-modal="true" />
          </div>
        </DialogContent>
      </DialogOverlay>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped lang="scss">
.sub-thread-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgb(0 0 0 / 0.55);
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
    box-shadow: 0 -4px 32px rgb(0 0 0 / 0.25);
    overflow: hidden;

    @media (min-width: 641px) {
      width: min(680px, 95vw);
      max-height: 80dvh;
      border-radius: 12px;
      box-shadow: 0 8px 40px rgb(0 0 0 / 0.3);
    }
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 12px;
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
    padding: 4px;
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
    padding: 16px;
    flex: 1;
    touch-action: pan-y;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }
}
</style>
