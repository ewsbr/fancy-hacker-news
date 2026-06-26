<script setup lang="ts">
import type { Component } from 'vue';
import { TooltipProvider } from 'reka-ui';
import { inject } from 'vue';
import AppShell from './components/layout/AppShell.vue';

const pageComponent = inject<Component>('pageComponent')!;
</script>

<template>
  <TooltipProvider
    :delay-duration="250"
    :skip-delay-duration="150"
    :disable-hoverable-content="true"
    :content="{ sideOffset: 10, collisionPadding: 12, avoidCollisions: true }"
  >
    <AppShell>
      <component :is="pageComponent" />
    </AppShell>
  </TooltipProvider>
</template>
