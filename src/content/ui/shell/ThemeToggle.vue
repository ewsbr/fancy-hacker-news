<script setup lang="ts">
import { computed, nextTick, ref, type ComponentPublicInstance } from 'vue';
import {
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from 'reka-ui';
import { Palette } from 'lucide-vue-next';
import { useTheme } from '@/state/theme';
import {
  getThemeMetadata,
  THEMES,
  type ThemeMetadata,
  type ThemeName,
} from '@/state/theme-metadata';
import { EXTENSION_ROOT_SELECTOR } from '@/content/utils/root-host';

const { theme, setTheme } = useTheme();
const open = ref(false);
const themeCardRefs = ref<Partial<Record<ThemeName, HTMLButtonElement | null>>>({});

function select(name: ThemeName) {
  setTheme(name);
  open.value = false;
}

function onOpenAutoFocus(event: Event) {
  event.preventDefault();
  void nextTick(() => {
    const activeCard = themeCardRefs.value[theme.value];
    const fallbackCard = THEMES
      .map(item => themeCardRefs.value[item.name])
      .find((card): card is HTMLButtonElement => card instanceof HTMLButtonElement);
    (activeCard ?? fallbackCard)?.focus();
  });
}

function setThemeCardRef(
  name: ThemeName,
  el: Element | ComponentPublicInstance | null,
) {
  themeCardRefs.value[name] = el instanceof HTMLButtonElement ? el : null;
}

function swatchStyle(themeMetadata: ThemeMetadata) {
  return {
    background: `linear-gradient(135deg, ${themeMetadata.surface} 50%, ${themeMetadata.accent} 50%)`,
  };
}

const activeTheme = computed(() => getThemeMetadata(theme.value));
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child>
      <button
        type="button"
        class="theme-toggle__trigger"
        :aria-label="`${activeTheme.label} theme, change theme`"
      >
        <span
          class="theme-toggle__trigger-swatch"
          :style="swatchStyle(activeTheme)"
          aria-hidden="true"
        />
        <span class="theme-toggle__trigger-label">{{ activeTheme.label }}</span>
        <Palette class="theme-toggle__palette-icon" :size="13" aria-hidden="true" />
      </button>
    </PopoverTrigger>

    <PopoverPortal defer :to="EXTENSION_ROOT_SELECTOR">
      <PopoverContent
        class="theme-toggle__popover"
        side="bottom"
        align="end"
        :side-offset="8"
        :collision-padding="12"
        @open-auto-focus="onOpenAutoFocus"
      >
        <p class="theme-toggle__popover-title">Theme</p>
        <div class="theme-toggle__grid">
          <button
            v-for="item in THEMES"
            :key="item.name"
            :ref="el => setThemeCardRef(item.name, el)"
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
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<style scoped lang="scss">
.theme-toggle {
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
    z-index: 200;
    width: 176px;
    padding: 0.65rem;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: var(--color-surface);
    box-shadow: var(--shadow-elevation), 0 12px 32px -6px rgba(0, 0, 0, 0.15);
    animation: tt-pop-in 0.18s ease;
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
}

@keyframes tt-pop-in {
  from {
    opacity: 0;
    transform: translateY(-6px) scale(0.97);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
