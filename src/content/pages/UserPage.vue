<script setup lang="ts">
import { inject } from 'vue';
import type { ParsedUserPage } from '@/parsers/user';
import UserProfile from '@/content/user/UserProfile.vue';
import UserLinks from '@/content/user/UserLinks.vue';

const pageData = inject<ParsedUserPage>('pageData')!;
</script>

<template>
  <div class="user-page">
    <UserProfile :user="pageData" />
    <UserLinks :user="pageData" />
  </div>
</template>

<style scoped lang="scss">
.user-page {
  padding: 1rem 0;
  max-width: 800px;
}
</style>
