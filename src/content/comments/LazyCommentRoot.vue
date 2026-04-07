<script setup lang="ts">
import { computed, ref } from 'vue';
import { MessageSquareMore } from 'lucide-vue-next';
import type { CommentNode as CommentNodeType } from '@/parsers/item';
import { parseCommentThreadRowsHtml } from '@/parsers/item';
import CommentNode from './CommentNode.vue';

const props = defineProps<{
  node: CommentNodeType;
  depth?: number;
  inModal?: boolean;
}>();

const loadedRoot = ref<CommentNodeType | null>(null);
const isLoading = ref(false);
const loadError = ref<string | null>(null);

const replyLabel = computed(() => {
  const count = props.node.descendantCount;
  return `Load thread (${count} ${count === 1 ? 'reply' : 'replies'})`;
});

async function loadThread() {
  if (!props.node.lazyThread || isLoading.value || loadedRoot.value) {
    return;
  }

  isLoading.value = true;
  loadError.value = null;

  try {
    const parsedRoot = parseCommentThreadRowsHtml(props.node.lazyThread.rowsHtml);
    if (!parsedRoot) {
      loadError.value = 'Failed to load this thread.';
      return;
    }

    loadedRoot.value = parsedRoot;
  } catch {
    loadError.value = 'Failed to load this thread.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="lazy-comment-root">
    <CommentNode
      v-if="loadedRoot"
      :node="loadedRoot"
      :depth="depth"
      :in-modal="inModal"
    />

    <template v-else>
      <CommentNode :node="node" :depth="depth" :in-modal="inModal" />

      <div class="lazy-comment-root__load-row">
        <button
          type="button"
          class="lazy-comment-root__thread-btn"
          :disabled="isLoading"
          @click="loadThread"
        >
          <MessageSquareMore :size="13" aria-hidden="true" class="lazy-comment-root__icon" />
          {{ replyLabel }}
        </button>
      </div>

      <p v-if="loadError" class="lazy-comment-root__error">{{ loadError }}</p>
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