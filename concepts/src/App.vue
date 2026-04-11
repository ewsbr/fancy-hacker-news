<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import ListsConcepts from './components/ListsConcepts.vue';
import LogoConcepts from './components/LogoConcepts.vue';
import MemorialBarConcepts from './components/MemorialBarConcepts.vue';
import NotFoundConcepts from './components/NotFoundConcepts.vue';
import SubmitConcepts from './components/SubmitConcepts.vue';
import TopColorsConcepts from './components/TopColorsConcepts.vue';
import TopNoticeConcepts from './components/TopNoticeConcepts.vue';

type ThemeName = 'light' | 'dark' | 'nord' | 'amoled';
type ConceptTabName = 'logo' | 'submit' | 'lists' | 'top-notice' | 'top-colors' | '404' | 'memorial-bar';

const storageKey = 'fancy-hn-concepts-theme';
const themes: Array<{ name: ThemeName; label: string }> = [
  { name: 'light', label: 'light' },
  { name: 'dark', label: 'dark' },
  { name: 'nord', label: 'nord' },
  { name: 'amoled', label: 'amoled' },
];

const tabs: Array<{ name: ConceptTabName; label: string }> = [
  { name: 'logo', label: 'logo' },
  { name: 'submit', label: 'submit' },
  { name: 'lists', label: 'lists' },
  { name: 'top-notice', label: 'top notice' },
  { name: 'top-colors', label: 'top colors' },
  { name: '404', label: '404' },
  { name: 'memorial-bar', label: 'memorial bar' },
];

const activeTheme = ref<ThemeName>('light');
const activeTab = ref<ConceptTabName>('logo');

function isThemeName(value: string | null): value is ThemeName {
  return value === 'light' || value === 'dark' || value === 'nord' || value === 'amoled';
}

watch(
  activeTheme,
  value => {
    if (value === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', value);
    }

    window.localStorage.setItem(storageKey, value);
  },
  { immediate: true },
);

onMounted(() => {
  const storedTheme = window.localStorage.getItem(storageKey);

  if (isThemeName(storedTheme)) {
    activeTheme.value = storedTheme;
  }
});
</script>

<template>
  <main class="concept-app">
    <header class="concept-app__hero">
      <h1 class="concept-app__title">Concepts</h1>

      <div class="theme-switcher" aria-label="theme switcher">
        <button
          v-for="theme in themes"
          :key="theme.name"
          type="button"
          class="theme-switcher__button"
          :class="{ 'is-active': activeTheme === theme.name }"
          @click="activeTheme = theme.name"
        >
          {{ theme.label }}
        </button>
      </div>
    </header>

    <nav class="concept-tabs" aria-label="Concept families">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        type="button"
        class="concept-tabs__button"
        :class="{ 'is-active': activeTab === tab.name }"
        @click="activeTab = tab.name"
      >
        {{ tab.label }}
      </button>
    </nav>

    <LogoConcepts v-if="activeTab === 'logo'" />
    <SubmitConcepts v-else-if="activeTab === 'submit'" />
    <ListsConcepts v-else-if="activeTab === 'lists'" />
    <TopNoticeConcepts v-else-if="activeTab === 'top-notice'" />
    <TopColorsConcepts v-else-if="activeTab === 'top-colors'" />
    <NotFoundConcepts v-else-if="activeTab === '404'" />
    <MemorialBarConcepts v-else-if="activeTab === 'memorial-bar'" />
  </main>
</template>