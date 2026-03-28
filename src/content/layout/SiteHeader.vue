<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import type { ParsedHeader } from '@/parsers/header';
import ThemeToggle from '../shared/ThemeToggle.vue';

const header = inject<ParsedHeader>('header')!;
const navOpen = ref(false);

const navLinks = computed(() => header.navLinks.filter((link) => link.label.toLowerCase() !== 'hacker news'));

function closeNav() {
  navOpen.value = false;
}
</script>

<template>
  <header class="site-header">
    <div class="header-container">
      <div class="header-mobile-row">
        <a href="/" class="brand">
          <span class="logo">Y</span>
          <span>Hacker News</span>
        </a>

        <button
          type="button"
          class="mobile-nav-toggle"
          @click="navOpen = !navOpen"
        >
          Menu ▾
        </button>
      </div>

      <nav class="nav-links" :class="{ open: navOpen }">
        <a
          v-for="link in navLinks"
          :key="link.href"
          :href="link.href"
          :class="{ 'is-active': link.active }"
          @click="closeNav"
        >{{ link.label }}</a>
      </nav>

      <div class="header-controls">
        <div class="user-controls">
          <template v-if="header.user">
            <strong>
              <a :href="`user?id=${header.user.name}`">{{ header.user.name }}</a>
            </strong>
            <span>({{ header.user.karma }})</span>
            <template v-if="header.logoutUrl">
              <span class="meta-divide">|</span>
              <a :href="header.logoutUrl">logout</a>
            </template>
          </template>
          <a v-else href="login">login</a>
        </div>

        <ThemeToggle />
      </div>
    </div>
  </header>
</template>
