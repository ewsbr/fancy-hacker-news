<script setup lang="ts">
import type { Component } from 'vue';
import type { ContentWidth, FeatureSettings } from '@/state/settings';
import {
  ArrowUpToLine,
  ExternalLink,
  ListCollapse,
} from 'lucide-vue-next';
import { computed, onMounted, ref } from 'vue';
import logoDarkUrl from '@/assets/logo-dark.svg';
import logoLightUrl from '@/assets/logo-light.svg';
import ThemeToggle from '@/content/components/layout/ThemeToggle.vue';
import {
  CONTENT_WIDTH_PRESETS,
  loadExtensionSettings,
  applySettingsToRootHost,
} from '@/state/settings';
import {
  replaceExtensionSettingsState,
  updateExtensionSettings,
  useExtensionSettings,
} from '@/state/settings-context';
import {
  getThemeMetadata,
} from '@/state/theme-metadata';
import FeatureSwitch from './components/FeatureSwitch.vue';

interface FeatureOption {
  key: keyof FeatureSettings;
  label: string;
  icon: Component;
}

const settings = useExtensionSettings();
const loadError = ref<string | null>(null);

const featureOptions = [
  {
    key: 'scrollToTop',
    label: 'Scroll-to-top button',
    icon: ArrowUpToLine,
  },
  {
    key: 'longPressCommentCollapse',
    label: 'Long-press comment collapse',
    icon: ListCollapse,
  },
  {
    key: 'openLinksInNewTab',
    label: 'Open links in new tab',
    icon: ExternalLink,
  },
] satisfies FeatureOption[];

const activeTheme = computed(() => getThemeMetadata(settings.theme));
const logoUrl = computed(() => activeTheme.value.scheme === 'dark' ? logoDarkUrl : logoLightUrl);

function setContentWidth(contentWidth: ContentWidth) {
  updateExtensionSettings(settings, { contentWidth });
}

function setFeature(feature: keyof FeatureSettings, enabled: boolean) {
  updateExtensionSettings(settings, {
    features: {
      [feature]: enabled,
    },
  });
}

onMounted(async () => {
  try {
    const storedSettings = await loadExtensionSettings();
    replaceExtensionSettingsState(settings, storedSettings);
    applySettingsToRootHost(settings);
  }
  catch (error) {
    if (error instanceof Error) {
      loadError.value = error.message;
      return;
    }

    throw error;
  }
});
</script>

<template>
  <div
    class="settings-page"
    :data-theme="settings.theme === 'light' ? null : settings.theme"
  >
    <header class="settings-header">
      <div class="settings-header__inner">
        <img class="settings-header__logo" :src="logoUrl" alt="" aria-hidden="true">
        <h1 class="settings-header__title">
          Fancy Hacker News
        </h1>
        <div class="settings-header__theme">
          <ThemeToggle portal-to=".settings-page" />
        </div>
      </div>
    </header>

    <main class="settings-main">
      <p v-if="loadError" class="settings-error" role="alert">
        {{ loadError }}
      </p>

      <section class="settings-section" aria-labelledby="features-heading">
        <div class="settings-section__head">
          <h2 id="features-heading" class="settings-section__title">
            Features
          </h2>
        </div>

        <div class="feature-list">
          <FeatureSwitch
            v-for="feature in featureOptions"
            :key="feature.key"
            :checked="settings.features[feature.key]"
            :icon="feature.icon"
            :label="feature.label"
            @update:checked="setFeature(feature.key, $event)"
          />
        </div>
      </section>

      <section class="settings-section" aria-labelledby="width-heading">
        <div class="settings-section__head">
          <h2 id="width-heading" class="settings-section__title">
            Content width
          </h2>
        </div>

        <div class="width-grid" role="group" aria-labelledby="width-heading">
          <button
            v-for="preset in CONTENT_WIDTH_PRESETS"
            :key="preset.name"
            type="button"
            class="width-option"
            :class="[
              `width-option--${preset.name}`,
              { 'width-option--active': settings.contentWidth === preset.name },
            ]"
            :aria-pressed="settings.contentWidth === preset.name"
            @click="setContentWidth(preset.name)"
          >
            <span class="width-option__preview" aria-hidden="true">
              <span class="width-option__viewport">
                <span class="width-option__measure" />
              </span>
            </span>
            <span class="width-option__copy">
              <span class="width-option__label">{{ preset.label }}</span>
              <span class="width-option__value">{{ preset.displayValue ?? preset.value }}</span>
            </span>
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped lang="scss">
@use "../styles/theme-tokens" as theme;

@include theme.apply-theme-tokens('.settings-page');

.settings-page,
.settings-page * {
  box-sizing: border-box;
}

.settings-page {
  position: fixed;
  inset: 0;
  overflow-y: auto;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

.settings-page button {
  font: inherit;
}

.settings-header {
  border-bottom: 1px solid var(--color-chrome-border);
  background: var(--color-chrome-surface);

  &__inner {
    width: 100%;
    max-width: 860px;
    margin: 0 auto;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__logo {
    width: 42px;
    height: 42px;
    flex: 0 0 auto;
  }

  &__title {
    min-width: 0;
    flex: 1;
    margin: 0;
    color: var(--color-text);
    font-family: var(--font-title);
    font-size: 1.25rem;
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: 0;
  }

  &__theme {
    flex: 0 0 auto;
  }
}

.settings-main {
  width: 100%;
  max-width: 860px;
  margin: 0 auto;
  padding: 12px;
  display: grid;
  align-content: start;
  gap: 14px;
}

.settings-error {
  margin: 0;
  padding: 8px 10px;
  border: 1px solid var(--color-danger-border);
  border-radius: 6px;
  background: var(--color-danger-bg);
  color: var(--color-danger);
  font-size: 0.875rem;
  font-weight: 700;
}

.settings-section {
  display: grid;
  align-content: start;
  gap: 8px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);

  &:first-of-type {
    padding-top: 0;
    border-top: 0;
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__title {
    margin: 0;
    font-family: var(--font-title);
    font-size: 1rem;
    line-height: 1.2;
  }
}

.feature-list,
.width-grid {
  display: grid;
  gap: 8px;
}

.feature-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.width-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.width-option {
  --width-option-measure: 58%;

  min-width: 0;
  min-height: 54px;
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  align-items: center;
  column-gap: 8px;
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  text-align: left;

  &:hover {
    border-color: var(--color-accent-badge-border);
    background: var(--color-accent-surface-subtle);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  &--active {
    border-color: var(--color-accent);
    box-shadow: inset 0 0 0 1px var(--color-accent);
  }

  &--compact {
    --width-option-measure: 52%;
  }

  &--default {
    --width-option-measure: 68%;
  }

  &--wide {
    --width-option-measure: 82%;
  }

  &--fluid {
    --width-option-measure: 100%;
  }

  &__preview {
    width: 48px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__viewport {
    width: 42px;
    height: 18px;
    padding: 3px;
    border: 1px solid var(--color-accent-muted);
    border-radius: 4px;
    display: flex;
    align-items: stretch;
    justify-content: center;
    background:
      linear-gradient(
        90deg,
        transparent 0 31%,
        color-mix(in srgb, var(--color-accent-muted) 28%, transparent) 31% 34%,
        transparent 34% 66%,
        color-mix(in srgb, var(--color-accent-muted) 28%, transparent) 66% 69%,
        transparent 69% 100%
      );
  }

  &__measure {
    width: var(--width-option-measure);
    border-radius: 2px;
    background: var(--color-accent-muted);
  }

  &__copy {
    min-width: 0;
    display: grid;
    gap: 2px;
  }

  &__label {
    display: block;
    min-width: 0;
    font-size: 0.86rem;
    font-weight: 800;
    line-height: 1.2;
  }

  &__value {
    display: block;
    min-width: 0;
    color: var(--color-text-muted);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    line-height: 1.25;
    overflow-wrap: anywhere;
  }
}

@media (max-width: 768px) {
  .settings-header__inner,
  .settings-main {
    max-width: 100%;
  }

  .feature-list,
  .width-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .settings-header__inner {
    padding: 8px;
  }

  .settings-header__logo {
    width: 26px;
    height: 26px;
  }

  .settings-header__title {
    font-size: 1rem;
  }

  .settings-main {
    padding: 10px 8px;
    gap: 12px;
  }

  .feature-list,
  .width-grid {
    grid-template-columns: 1fr;
  }
}
</style>
