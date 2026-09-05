<script setup lang="ts">
import type { CommentNode as CommentNodeType } from '@/parsers/item';
import { X } from 'lucide-vue-next';
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui';
import { inject, nextTick, useTemplateRef, watch } from 'vue';
import { useCommentFragmentLoading } from '@/content/composables/comment-fragment-loading';
import {
  useCommentCollapseRegistry,
  useDelegatedCommentLongPress,
} from '@/content/composables/comment-node';
import { provideCommentHeightEstimates } from '@/content/composables/comment-placeholders';
import { useCommentRenderCompletion } from '@/content/composables/comment-rendering';
import { EXTENSION_ROOT_SELECTOR } from '@/content/utils/root-host';
import { waitForAnimationFrames } from '@/content/utils/wait';
import { COMMENT_FRAGMENT_STATE_KEY } from '@/state/fragment-state';
import CommentNode from './CommentNode.vue';
import FragmentLoading from './FragmentLoading.vue';

const props = defineProps<{
  node: CommentNodeType;
  scrollToId?: string | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const bodyRef = useTemplateRef<HTMLElement>('body');
const closeButtonRef = useTemplateRef<HTMLButtonElement>('closeButton');
const collapseRegistry = useCommentCollapseRegistry();
const whenCommentsRendered = useCommentRenderCompletion();
const fragmentLoading = useCommentFragmentLoading();
const fragmentState = inject(COMMENT_FRAGMENT_STATE_KEY, null);
provideCommentHeightEstimates(bodyRef, { inModal: true });

useDelegatedCommentLongPress(bodyRef, collapseRegistry);

async function scrollToTargetComment(targetId: string, isCurrent: () => boolean, startPositioning?: () => void) {
  await nextTick();
  await whenCommentsRendered();
  await waitForAnimationFrames(2);

  if (!isCurrent()) {
    return;
  }

  const target = bodyRef.value?.querySelector<HTMLElement>(`#${CSS.escape(targetId)}`) ?? null;
  if (!target) {
    return;
  }

  const header = target.querySelector<HTMLElement>('.comment-node__header') ?? target;
  startPositioning?.();
  header.scrollIntoView({ block: 'start', behavior: 'instant' });
  await waitForAnimationFrames(1);
}

function onOpenChange(open: boolean) {
  if (!open) {
    if (fragmentLoading?.isPending.value) fragmentLoading.cancel();
    emit('close');
  }
}

function onOpenAutoFocus(event: Event) {
  event.preventDefault();
  closeButtonRef.value?.focus({ preventScroll: true });
}

watch(
  [() => props.node.id, () => props.scrollToId, () => fragmentState?.hashNavigationVersion.value],
  async ([_nodeId, scrollToId], _previous, onCleanup) => {
    if (!scrollToId) return;
    const task = fragmentLoading?.track(scrollToId);
    let active = true;
    onCleanup(() => {
      active = false;
      task?.finish();
    });
    try {
      await scrollToTargetComment(scrollToId, () => active && (task?.isCurrent() ?? true), task?.startPositioning);
    } finally {
      task?.finish();
    }
  },
  { immediate: true, flush: 'post' },
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
              <button ref="closeButton" class="sub-thread-modal__close" aria-label="Close thread">
                <X :size="18" />
              </button>
            </DialogClose>
          </div>
          <div class="sub-thread-modal__body-region">
            <div
              ref="body"
              class="sub-thread-modal__body"
              :inert="fragmentLoading?.isPending.value && fragmentLoading.isInitialNavigation.value"
              :aria-busy="fragmentLoading?.isPending.value ?? false"
            >
              <CommentNode :node="node" :depth="0" :in-modal="true" />
            </div>
            <FragmentLoading
              v-if="fragmentLoading?.isPending.value"
              :cover="fragmentLoading.isInitialNavigation.value"
              :show-indicator="fragmentLoading.showIndicator.value"
            />
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

  &__body-region {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  &__body {
    overflow-y: auto;
    scrollbar-gutter: stable;
    padding: 16px;
    flex: 1;
    touch-action: pan-y;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;

    &[inert] {
      overflow-y: hidden;
    }
  }
}
</style>
