<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Search, X } from 'lucide-vue-next';
import Keycap from '@/content/shared/Keycap.vue';
import { restoreFocus, trapFocusWithin } from '@/content/utils/focusTrap';

const emit = defineEmits<{ close: [] }>();

const query = ref('');
const inputRef = ref<HTMLInputElement>();
const panelRef = ref<HTMLElement>();
const previousFocus = ref<HTMLElement | null>(null);

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close');
    return;
  }

  if (panelRef.value) {
    trapFocusWithin(e, panelRef.value);
  }
}

function submit() {
  const q = query.value.trim();
  if (!q) return;
  window.open(`https://hn.algolia.com/?q=${encodeURIComponent(q)}`, '_blank', 'noopener,noreferrer');
  emit('close');
}

function onBackdropClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('search-modal__backdrop')) {
    emit('close');
  }
}

onMounted(() => {
  previousFocus.value = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  inputRef.value?.focus();
  document.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown);
  restoreFocus(previousFocus.value);
});
</script>

<template>
  <div class="search-modal">
    <div class="search-modal__backdrop" @click="onBackdropClick">
      <div ref="panelRef" class="search-modal__panel" role="dialog" aria-modal="true" aria-label="Search Hacker News">
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
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.search-modal {
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
    width: 100%;
    max-width: 560px;
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
