<script setup lang="ts">
import type { ParsedUserPage } from '@/parsers/user';

defineProps<{
  user: ParsedUserPage;
}>();
</script>

<template>
  <div class="user-links">
    <a :href="user.submissionsLink" class="user-links__link">submissions</a>
    <span class="user-links__separator" aria-hidden="true">|</span>
    <a :href="user.threadsLink" class="user-links__link">comments</a>
    
    <template v-if="user.upvotedLink || user.upvotedCommentsLink">
      <span class="user-links__separator" aria-hidden="true">|</span>
      <span class="user-links__group">
        upvoted <a v-if="user.upvotedLink" :href="user.upvotedLink" class="user-links__link">submissions</a>
        <template v-if="user.upvotedLink && user.upvotedCommentsLink"> / </template>
        <a v-if="user.upvotedCommentsLink" :href="user.upvotedCommentsLink" class="user-links__link">comments</a>
      </span>
    </template>
    
    <template v-if="user.favoritesLink || user.favoritesCommentsLink">
      <span class="user-links__separator" aria-hidden="true">|</span>
      <span class="user-links__group">
        favorites <a v-if="user.favoritesLink" :href="user.favoritesLink" class="user-links__link">submissions</a>
        <template v-if="user.favoritesLink && user.favoritesCommentsLink"> / </template>
        <a v-if="user.favoritesCommentsLink" :href="user.favoritesCommentsLink" class="user-links__link">comments</a>
      </span>
    </template>
  </div>
</template>

<style scoped lang="scss">
.user-links {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-muted);

  &__link {
    color: var(--color-text);
    text-decoration: underline;
    text-underline-offset: 2px;
    text-decoration-color: var(--color-border);
    transition: color 0.2s, text-decoration-color 0.2s;

    &:hover {
      color: var(--color-accent);
      text-decoration-color: var(--color-accent);
    }
  }

  &__separator {
    color: var(--color-border);
    opacity: 0.5;
  }

  &__group {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
}
</style>
