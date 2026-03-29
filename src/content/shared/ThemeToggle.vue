<script setup lang="ts">
import { ref } from 'vue';
import { useTheme, type ThemeName } from '@/state/theme';

const { theme, setTheme } = useTheme();
const open = ref(false);

const themes: { name: ThemeName; label: string; bg: string; accent: string }[] = [
  { name: 'light',  label: 'Light',  bg: '#f6f6ef', accent: '#ff6600' },
  { name: 'dark',   label: 'Dark',   bg: '#252526', accent: '#ff6600' },
  { name: 'nord',   label: 'Nord',   bg: '#2e3440', accent: '#88c0d0' },
  { name: 'amoled', label: 'AMOLED', bg: '#000000', accent: '#ffffff' },
];

function swatchStyle(t: (typeof themes)[number]) {
  return { background: `linear-gradient(135deg, ${t.bg} 50%, ${t.accent} 50%)` };
}

function select(name: ThemeName) {
  setTheme(name);
  open.value = false;
}

function onBlur(e: FocusEvent) {
  const related = e.relatedTarget as HTMLElement | null;
  const root = (e.currentTarget as HTMLElement);
  if (!root.contains(related)) open.value = false;
}
</script>

<template>
  <div class="theme-toggle" @focusout="onBlur">
    <!-- Trigger button -->
    <button
      type="button"
      class="theme-toggle__trigger"
      :aria-expanded="open"
      aria-haspopup="listbox"
      aria-label="Change theme"
      @click="open = !open"
    >
      <span
        class="theme-toggle__swatch"
        :style="swatchStyle(themes.find(t => t.name === theme)!)"
        aria-hidden="true"
      />
      <span class="theme-toggle__label">{{ themes.find(t => t.name === theme)?.label }}</span>
      <svg class="theme-toggle__chevron" :class="{ 'theme-toggle__chevron--open': open }"
           width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- Dropdown -->
    <Transition name="theme-toggle-drop">
      <ul v-if="open" class="theme-toggle__menu" role="listbox" :aria-label="'Theme selector'">
        <li
          v-for="item in themes"
          :key="item.name"
          role="option"
          :aria-selected="theme === item.name"
          class="theme-toggle__option"
          :class="{ 'theme-toggle__option--active': theme === item.name }"
          tabindex="0"
          @click="select(item.name)"
          @keydown.enter.space.prevent="select(item.name)"
        >
          <span
            class="theme-toggle__swatch"
            :style="swatchStyle(item)"
            aria-hidden="true"
          />
          <span>{{ item.label }}</span>
          <svg v-if="theme === item.name" class="theme-toggle__check"
               width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6L5 9L10 3" stroke="currentColor" stroke-width="1.75"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.theme-toggle {
  position: relative;
}

/* ── Trigger ─────────────────────────────────────────── */
.theme-toggle__trigger {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.5rem 0.25rem 0.35rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-code-bg);
  color: var(--color-text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;

  &:hover {
    border-color: var(--color-accent);
    background: var(--color-surface);
    color: var(--color-text);
  }
}

/* ── Swatch (shared by trigger + options) ─────────────── */
.theme-toggle__swatch {
  flex-shrink: 0;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  box-shadow: 0 0 0 1.5px var(--color-border);
}

/* ── Label ───────────────────────────────────────────── */
.theme-toggle__label {
  color: var(--color-text);
  font-weight: 600;
}

/* ── Chevron ─────────────────────────────────────────── */
.theme-toggle__chevron {
  transition: transform 0.2s ease;
  color: var(--color-text-muted);

  &--open {
    transform: rotate(180deg);
  }
}

/* ── Dropdown menu ───────────────────────────────────── */
.theme-toggle__menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 200;
  min-width: 140px;
  margin: 0;
  padding: 0.3rem;
  list-style: none;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  box-shadow: var(--shadow-elevation),
              0 8px 24px -4px rgba(0, 0, 0, 0.12);
}

/* ── Option ──────────────────────────────────────────── */
.theme-toggle__option {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.45rem 0.6rem;
  border-radius: 5px;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  transition: background 0.12s, color 0.12s;

  &:hover {
    background: var(--color-code-bg);
    color: var(--color-text);
  }

  &--active {
    color: var(--color-text);
    font-weight: 600;
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: -1px;
  }
}

.theme-toggle__check {
  margin-left: auto;
  color: var(--color-accent);
}

/* ── Dropdown transition ─────────────────────────────── */
.theme-toggle-drop-enter-active,
.theme-toggle-drop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.theme-toggle-drop-enter-from,
.theme-toggle-drop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
