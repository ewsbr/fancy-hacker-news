<script setup lang="ts">
import { inject, ref } from 'vue';
import { Check } from 'lucide-vue-next';
import type { ParsedTopColorsPage } from '@/parsers/top-colors';

const page = inject<ParsedTopColorsPage>('pageData')!;

const copied = ref<string | null>(null);
let copyTimer: ReturnType<typeof setTimeout> | null = null;

function contrast(hex: string): 'dark' | 'light' {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lin = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return lum > 0.35 ? 'dark' : 'light';
}

async function copy(hex: string) {
  try {
    await navigator.clipboard.writeText(hex);
    copied.value = hex;
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { copied.value = null; }, 1200);
  } catch {
    // clipboard unavailable — silently ignore
  }
}
</script>

<template>
  <div class="topcolors-page">
    <h1 class="topcolors-page__title">Top Colors</h1>

    <div class="topcolors-page__card hn-content-card">
      <div class="topcolors-page__grid">
        <div
          v-for="hex in page.colors"
          :key="hex"
          class="topcolors-page__tile"
          :class="[
            `topcolors-page__tile--${contrast(hex)}`,
            { 'topcolors-page__tile--copied': copied === hex },
          ]"
          :style="{ background: hex }"
          :title="copied === hex ? 'Copied!' : `Click to copy ${hex}`"
          role="button"
          tabindex="0"
          @click="copy(hex)"
          @keydown.enter.space.prevent="copy(hex)"
        >
          <span class="topcolors-page__hex">
            <template v-if="copied === hex">
              <Check class="topcolors-page__check" :size="11" :stroke-width="3" aria-hidden="true" />
              <span>Copied</span>
            </template>
            <template v-else>{{ hex }}</template>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.topcolors-page {
  padding: 2rem 0;

  &__title {
    margin-bottom: 1.25rem;
    font-family: var(--font-title);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text);
  }

  &__card {
    padding: 0;
    overflow: hidden;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(4rem, 1fr));
    gap: 2px;
    padding: 2px;
  }

  &__tile {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.1s;

    &:hover {
      transform: scale(1.12);
      z-index: 1;
      position: relative;
    }

    &--copied {
      z-index: 1;
      position: relative;
      outline: 2px solid rgba(255, 255, 255, 0.8);
      outline-offset: -2px;
    }
  }

  &__hex {
    font-family: var(--font-mono);
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    text-align: center;
    line-height: 1;
    padding: 0 2px;
    display: flex;
    align-items: center;
    gap: 2px;
  }

  &__check {
    flex-shrink: 0;
  }

  &__tile--dark &__hex {
    color: rgba(0, 0, 0, 0.72);
  }

  &__tile--light &__hex {
    color: rgba(255, 255, 255, 0.9);
  }
}
</style>
