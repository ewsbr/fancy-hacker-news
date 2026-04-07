<script setup lang="ts">
import { ref } from 'vue';
import { Palette } from 'lucide-vue-next';
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
  const root = e.currentTarget as HTMLElement;
  if (!root.contains(related)) open.value = false;
}

const activeTheme = () => themes.find(t => t.name === theme.value)!;
</script>

<template>
  <div class="theme-toggle" @focusout="onBlur">
    <!-- Trigger: current swatch + label + palette icon -->
    <button
      type="button"
      class="theme-toggle__trigger"
      :aria-expanded="open"
      aria-haspopup="dialog"
      aria-label="Change theme"
      @click="open = !open"
    >
      <span
        class="theme-toggle__trigger-swatch"
        :style="swatchStyle(activeTheme())"
        aria-hidden="true"
      />
      <span class="theme-toggle__trigger-label">{{ activeTheme().label }}</span>
      <Palette class="theme-toggle__palette-icon" :size="13" aria-hidden="true" />
    </button>

    <!-- Popover card -->
    <Transition name="tt-pop">
      <div
        v-if="open"
        class="theme-toggle__popover"
        role="dialog"
        aria-label="Theme selector"
      >
        <p class="theme-toggle__popover-title">Theme</p>
        <div class="theme-toggle__grid">
          <button
            v-for="item in themes"
            :key="item.name"
            type="button"
            class="theme-toggle__card"
            :class="{ 'theme-toggle__card--active': theme === item.name }"
            :aria-pressed="theme === item.name"
            :aria-label="item.label"
            @click="select(item.name)"
          >
            <span
              class="theme-toggle__card-swatch"
              :style="swatchStyle(item)"
              aria-hidden="true"
            />
            <span class="theme-toggle__card-label">{{ item.label }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.theme-toggle {
  position: relative;

  // ── Trigger ─────────────────────────────────────────── 
  &__trigger {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.25rem 0.55rem 0.25rem 0.35rem;
    border: 1px solid var(--color-border);
    border-radius: 20px;
    background: var(--color-code-bg);
    color: var(--color-text-muted);
    font-size: 0.82rem;
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

  &__trigger-swatch {
    flex-shrink: 0;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    box-shadow: 0 0 0 1.5px var(--color-border);
  }

  &__trigger-label {
    color: var(--color-text);
    font-weight: 700;
    font-size: 0.82rem;
  }

  &__palette-icon {
    opacity: 0.7;
    transition: opacity 0.15s;

    .theme-toggle__trigger:hover & {
      opacity: 1;
      color: var(--color-accent);
    }
  }

  // ── Popover card ─────────────────────────────────────── 
  &__popover {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    z-index: 200;
    width: 176px;
    padding: 0.65rem;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: var(--color-surface);
    box-shadow: var(--shadow-elevation), 0 12px 32px -6px rgba(0, 0, 0, 0.15);
  }

  &__popover-title {
    margin: 0 0 0.6rem 0.15rem;
    color: var(--color-text-muted);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
  }

  // ── 2×2 swatch grid ─────────────────────────────────── 
  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.45rem;
  }

  &__card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    padding: 0.65rem 0.4rem 0.55rem;
    border: 2px solid transparent;
    border-radius: 4px;
    background: var(--color-code-bg);
    cursor: pointer;
    font-family: inherit;
    transition: border-color 0.15s, background 0.15s;

    &:hover {
      border-color: var(--color-accent-badge-border);
      background: var(--color-bg);
    }

    &--active {
      border-color: var(--color-accent);
      background: var(--color-accent-surface);

      .theme-toggle__card-swatch {
        box-shadow: 0 0 0 2px var(--color-surface),
                    0 0 0 3.5px var(--color-accent);
      }
    }

    &:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }
  }

  &__card-swatch {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    box-shadow: 0 0 0 1.5px var(--color-border);
    transition: box-shadow 0.15s;
  }

  &__card-label {
    color: var(--color-text);
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1;

    .theme-toggle__card--active & {
      color: var(--color-accent);
    }
  }

  // ── Popover transition ───────────────────────────────── 
  &.tt-pop-enter-active,
  &.tt-pop-leave-active {
    transition: opacity 0.18s ease, transform 0.18s ease;
  }

  &.tt-pop-enter-from,
  &.tt-pop-leave-to {
    opacity: 0;
    transform: translateY(-6px) scale(0.97);
  }
}

.tt-pop-enter-active,
.tt-pop-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.tt-pop-enter-from,
.tt-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>
