<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import {
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui';
import { Search, X } from 'lucide-vue-next';
import Keycap from '@/content/ui/primitives/Keycap.vue';
import { EXTENSION_ROOT_SELECTOR } from '@/content/utils/rootHost';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const query = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

function submit() {
  const q = query.value.trim();
  if (!q) return;
  window.open(`https://hn.algolia.com/?q=${encodeURIComponent(q)}`, '_blank', 'noopener,noreferrer');
  emit('update:open', false);
}

function onOpenAutoFocus(event: Event) {
  event.preventDefault();
  void nextTick(() => {
    inputRef.value?.focus({ preventScroll: true });
  });
}

watch(() => props.open, isOpen => {
  if (!isOpen) {
    query.value = '';
  }
});
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal defer :to="EXTENSION_ROOT_SELECTOR">
      <DialogOverlay class="search-modal__backdrop" @click.stop>
        <DialogContent
          class="search-modal__panel"
          aria-describedby="undefined"
          @click.stop
          @open-auto-focus="onOpenAutoFocus"
        >
          <DialogTitle class="search-modal__sr-only">Search Hacker News</DialogTitle>

          <form class="search-modal__form" @submit.prevent="submit">
            <Search :size="18" class="search-modal__form-icon" aria-hidden="true" />
            <input
              ref="inputRef"
              v-model="query"
              type="search"
              class="search-modal__input"
              placeholder="Search Hacker News…"
              autocomplete="off"
              spellcheck="false"
            />
            <button
              v-if="query"
              type="button"
              class="search-modal__clear"
              aria-label="Clear"
              @click="query = ''"
            >
              <X :size="15" />
            </button>
          </form>
          <div class="search-modal__footer">
            <span class="search-modal__footer-hint">
              <Keycap>Enter</Keycap> to search on Algolia &nbsp;·&nbsp; <Keycap>Esc</Keycap> to close
            </span>
          </div>
        </DialogContent>
      </DialogOverlay>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped lang="scss">
.search-modal {
  &__sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  &__backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: var(--color-overlay);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 12vh;
    padding-left: 1rem;
    padding-right: 1rem;
    animation: search-modal-fade-in 0.12s ease;
  }

  &__panel {
    max-width: 560px;
    width: 100%;
    border-radius: 10px;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    box-shadow: var(--shadow-modal);
    overflow: hidden;
    animation: search-modal-slide-in 0.15s ease;
  }

  &__form {
    display: flex;
    align-items: center;
    gap: 0;
    padding: 0 1rem;
    border-bottom: 1px solid var(--color-border);
  }

  &__form-icon {
    color: var(--color-text-muted);
    flex-shrink: 0;
    pointer-events: none;
  }

  &__input {
    flex: 1;
    padding: 1rem 0.75rem;
    border: none;
    background: transparent;
    color: var(--color-text);
    font-family: var(--font-body);
    font-size: 1.05rem;
    outline: none;

    &::placeholder {
      color: var(--color-text-muted);
      opacity: 0.65;
    }

    // Remove native search decorations
    &::-webkit-search-cancel-button,
    &::-webkit-search-decoration {
      -webkit-appearance: none;
    }
  }

  &__clear {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    flex-shrink: 0;
    transition: color 0.12s, border-color 0.12s;

    &:hover {
      color: var(--color-text);
      border-color: var(--color-text-muted);
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0.55rem 1rem;
    background: var(--color-bg);
  }

  &__footer-hint {
    font-size: 0.78rem;
    color: var(--color-text-muted);
  }
}

@keyframes search-modal-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes search-modal-slide-in {
  from { transform: translateY(-8px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
</style>
