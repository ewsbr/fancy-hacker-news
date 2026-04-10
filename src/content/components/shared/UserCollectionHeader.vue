<script setup lang="ts">
import type { UserCollectionIntro } from '@/content/utils/user-collection-intro';

defineProps<{
  intro: UserCollectionIntro;
  activeKind: 'stories' | 'comments';
}>();
</script>

<template>
  <section class="user-collection-header">
    <nav class="user-collection-header__tabs" aria-label="Collection sections">
      <template v-for="(link, index) in intro.links" :key="link.href">
        <a
          :href="link.href"
          class="user-collection-header__tab"
          :class="{ 'user-collection-header__tab--active': link.kind === activeKind }"
          :aria-current="link.kind === activeKind ? 'page' : undefined"
        >
          {{ link.label }}
        </a>
        <span
          v-if="index < intro.links.length - 1"
          class="user-collection-header__sep"
          aria-hidden="true"
        >
          /
        </span>
      </template>
    </nav>

    <div v-if="intro.messages.length" class="user-collection-header__messages">
      <p
        v-for="message in intro.messages"
        :key="message"
        class="user-collection-header__message"
      >
        {{ message }}
      </p>
    </div>
  </section>
</template>

<style scoped lang="scss">
.user-collection-header {
  padding: 0.9rem 1rem 1rem;
  border-bottom: 1px solid var(--color-border);

  &__tabs {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem;
  }

  &__tab {
    font-family: var(--font-title);
    color: var(--color-text-muted);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-decoration: none;
    text-transform: uppercase;
    transition: color 0.15s ease;

    &:hover {
      color: var(--color-accent);
    }

    &--active {
      color: var(--color-text);
    }
  }

  &__sep {
    color: var(--color-text-muted);
    font-size: 0.8rem;
  }

  &__messages {
    margin-top: 0.8rem;
    padding-top: 0.8rem;
    border-top: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: 0.9rem;
    line-height: 1.55;
  }

  &__message {
    margin: 0;
  }

  &__message + &__message {
    margin-top: 0.35rem;
  }
}
</style>
