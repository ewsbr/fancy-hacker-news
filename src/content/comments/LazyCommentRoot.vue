<script setup lang="ts">
import { computed, ref } from 'vue';
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
  return `${count} ${count === 1 ? 'reply' : 'replies'}`;
});

async function loadThread() {
  const lazyThread = props.node.lazyThread;
  if (!lazyThread || isLoading.value) {
    return;
  }

  isLoading.value = true;
  loadError.value = null;

  try {
    const parsedRoot = parseCommentThreadRowsHtml(lazyThread.rowsHtml);
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

function unloadThread() {
  loadedRoot.value = null;
  loadError.value = null;
}
</script>

<template>
  <div class="lazy-comment-root">
    <div v-if="loadedRoot" class="lazy-comment-root__loaded-controls">
      <button type="button" class="lazy-comment-root__toggle" @click="unloadThread">
        Unload thread
      </button>
    </div>

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
          class="lazy-comment-root__toggle"
          :disabled="isLoading"
          @click="loadThread"
        >
          {{ isLoading ? 'Loading thread...' : `Load thread (${replyLabel})` }}
        </button>
      </div>

      <p v-if="loadError" class="lazy-comment-root__error">{{ loadError }}</p>
    </template>
  </div>
</template>

<style scoped lang="scss">
.lazy-comment-root {
  &__loaded-controls,
  &__load-row {
    margin: 0.35rem 0 0.8rem 1rem;
  }

  &__toggle {
    border: 1px solid var(--color-border);
    background: color-mix(in srgb, var(--color-surface) 94%, var(--color-accent) 6%);
    color: var(--color-text);
    border-radius: 999px;
    padding: 0.32rem 0.78rem;
    font: inherit;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;

    &:hover:not(:disabled),
    &:focus-visible {
      border-color: color-mix(in srgb, var(--color-accent) 40%, var(--color-border));
      color: var(--color-accent);
      outline: none;
    }

    &:disabled {
      opacity: 0.7;
      cursor: wait;
    }
  }

  &__error {
    margin: -0.3rem 0 0.8rem 1rem;
    color: #b42318;
    font-size: 0.82rem;
  }

  @media (max-width: 640px) {
    &__loaded-controls,
    &__load-row,
    &__error {
      margin-left: 0;
    }

    &__toggle {
      font-size: 0.94rem;
      padding: 0.46rem 0.92rem;
    }
  }
}
</style>