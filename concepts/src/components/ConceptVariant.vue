<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    eyebrow?: string;
    tag?: string;
    density?: 'default' | 'compact';
  }>(),
  {
    eyebrow: undefined,
    tag: 'article',
    density: 'default',
  },
);
</script>

<template>
  <component :is="tag" class="concept-variant-shell" :class="{ 'concept-variant-shell--compact': density === 'compact' }">
    <header class="concept-variant-shell__header">
      <p v-if="eyebrow" class="concept-variant-shell__eyebrow">{{ eyebrow }}</p>

      <div class="concept-variant-shell__title-row">
        <h3 class="concept-variant-shell__title">{{ title }}</h3>
        <slot name="title-trailing" />
      </div>

      <div v-if="$slots.description" class="concept-variant-shell__description">
        <slot name="description" />
      </div>
    </header>

    <slot />
  </component>
</template>

<style scoped lang="scss">
.concept-variant-shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.concept-variant-shell__header {
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.concept-variant-shell__eyebrow {
  margin: 0 0 0.3rem;
  color: var(--color-accent);
  font-family: var(--font-title);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.concept-variant-shell__title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.concept-variant-shell__title {
  margin: 0;
  font-family: var(--font-title);
  font-size: 1.1rem;
  font-weight: 800;
  line-height: 1.1;
}

.concept-variant-shell__description {
  margin-top: 0.4rem;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  line-height: 1.55;
}

.concept-variant-shell__description :deep(p) {
  margin: 0;
}

.concept-variant-shell__description :deep(p + p) {
  margin-top: 0.35rem;
}

.concept-variant-shell__description :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.8em;
  background: var(--color-code-bg);
  padding: 0.1em 0.35em;
  border-radius: 3px;
}

.concept-variant-shell--compact {
  gap: 0.8rem;
}

.concept-variant-shell--compact .concept-variant-shell__header {
  padding-bottom: 0.45rem;
}

.concept-variant-shell--compact .concept-variant-shell__title {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.15;
}

.concept-variant-shell--compact .concept-variant-shell__description {
  margin-top: 0.25rem;
  font-size: 0.84rem;
}
</style>