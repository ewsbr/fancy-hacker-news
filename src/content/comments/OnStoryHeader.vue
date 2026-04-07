<script setup lang="ts">
defineProps<{
  label: string;
  href: string;
  title: string;
  block?: boolean;
}>();
</script>

<template>
  <div class="on-story-header" :class="{ 'on-story-header--block': block }">
    <span class="on-story-header__label">{{ label }}</span>
    <a :href="href" class="on-story-header__link">{{ title }}</a>
  </div>
</template>

<style scoped lang="scss">
.on-story-header {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  min-width: 0;
  max-width: 100%;
  font-size: 0.85rem;
  line-height: 1.4;

  &--block {
    display: block;
    padding: 0.6rem 0.75rem 0.55rem;
    background: var(--color-accent-surface);
    border-bottom: 1px solid var(--color-border);

    .on-story-header__label {
      display: block;
      letter-spacing: 0.07em;
      margin-bottom: 0.2rem;
    }

    .on-story-header__link {
      display: block;
      font-family: var(--font-title);
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--color-text);
      overflow: visible;
      text-overflow: unset;
      white-space: normal;
      line-height: 1.3;

      &:hover {
        color: var(--color-accent);
      }
    }
  }

  &__label {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-text-muted);
    flex-shrink: 0;
  }

  &__link {
    min-width: 0;
    max-width: 100%;
    color: var(--color-accent-muted);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 640px) {
    align-items: flex-start;

    &__link {
      white-space: normal;
      overflow: visible;
      text-overflow: unset;
      overflow-wrap: anywhere;
    }
  }
}
</style>
