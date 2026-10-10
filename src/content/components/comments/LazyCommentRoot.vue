<script setup lang="ts">
import type { CommentNode as CommentNodeType } from '@/parsers/item';
import { MessageSquareMore } from 'lucide-vue-next';
import { ref, shallowRef } from 'vue';
import { createLogger } from '@/debug';
import { loadDeferredCommentThread } from '@/state/item-page-state';
import CommentNode from './CommentNode.vue';

const props = defineProps<{
  node: CommentNodeType;
}>();

const logger = createLogger('lazy-comment-root');
const loadedRoot = shallowRef(props.node.lazyThread?.state.kind === 'loaded' ? props.node.lazyThread.state.root : null);
const loadError = ref<string | null>(null);
const replyLabel = `Load thread (${props.node.descendantCount} ${props.node.descendantCount === 1 ? 'reply' : 'replies'})`;

function loadThread() {
  loadError.value = null;
  try {
    loadedRoot.value = loadDeferredCommentThread(props.node.lazyThread!);
  } catch (error) {
    logger.error(`Failed to parse thread ${props.node.id}`, error);
    loadError.value = 'Failed to load this thread.';
  }
}
</script>

<template>
  <div class="lazy-comment-root">
    <CommentNode v-if="loadedRoot" :node="loadedRoot" />

    <template v-else>
      <CommentNode :node="node" />

      <div class="lazy-comment-root__load-row">
        <button
          type="button"
          class="lazy-comment-root__thread-btn"
          @click="loadThread"
        >
          <MessageSquareMore :size="13" aria-hidden="true" class="lazy-comment-root__icon" />
          {{ replyLabel }}
        </button>
      </div>

      <p v-if="loadError" class="lazy-comment-root__error">
        {{ loadError }}
      </p>
    </template>
  </div>
</template>

<style scoped lang="scss">
.lazy-comment-root {
  &__load-row {
    margin: 0.35rem 0 0.8rem;
  }

  &__thread-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    border: 1px solid var(--color-border);
    background: none;
    color: var(--color-text-muted);
    border-radius: 20px;
    padding: 0.45rem 0.75rem;
    font: inherit;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;

    &:hover:not(:disabled),
    &:focus-visible {
      border-color: var(--color-accent);
      color: var(--color-accent);
      outline: none;
    }

    &:disabled {
      opacity: 0.7;
      cursor: wait;
    }
  }

  &__icon {
    flex: 0 0 auto;
  }

  &__error {
    margin: -0.3rem 0 0.8rem;
    color: #b42318;
    font-size: 0.82rem;
  }

  @media (max-width: 640px) {
    &__thread-btn {
      font-size: 0.86rem;
      padding: 0.5rem 0.82rem;
    }
  }
}
</style>
