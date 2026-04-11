<script setup lang="ts">
import ConceptVariant from './ConceptVariant.vue';

const stories = [
  { title: 'Ask HN: How do you manage information overload?', meta: '312 points · 4 hours ago · 178 comments' },
  { title: 'The collapse of SVB and what it means for startups', meta: '894 points · 6 hours ago · 401 comments' },
  { title: 'Quine in Rust using proc macros', meta: '210 points · 2 hours ago · 43 comments' },
] as const;
</script>

<template>
  <section class="concept-app__section-head">
    <div>
      <p class="concept-app__section-eyebrow">top notice</p>
      <h2 class="concept-app__section-title">Six directions for the date-range notice above story lists</h2>
    </div>
    <p class="concept-app__section-copy">
      These variants stay close to the existing Hacker News notice content and only change how that meta block sits against the list card.
    </p>
  </section>

  <section class="notice-concepts">
    <ConceptVariant tag="section" class="notice-variant" eyebrow="Variant 1" title="Current thin border box">
      <aside class="top-notice top-notice--v1">
        <div class="top-notice__content">
          <p>Stories from April 4, 2026 (UTC)</p>
          <p>
            Go back a <a href="#">day</a>,
            <a href="#">month</a>, or
            <a href="#">year</a>.
            Go forward a <a href="#">day</a>.
          </p>
        </div>
      </aside>
      <div class="hn-card">
        <div v-for="story in stories" :key="`v1-${story.title}`" class="hn-card__row">
          <span class="hn-card__title">{{ story.title }}</span>
          <span class="hn-card__meta">{{ story.meta }}</span>
        </div>
      </div>
    </ConceptVariant>

    <ConceptVariant tag="section" class="notice-variant" eyebrow="Variant 2" title="Plain caption with no box">
      <aside class="top-notice top-notice--v2">
        <div class="top-notice__content">
          <p>Stories from April 4, 2026 (UTC)</p>
          <p>
            Go back a <a href="#">day</a>,
            <a href="#">month</a>, or
            <a href="#">year</a>.
            Go forward a <a href="#">day</a>.
          </p>
        </div>
      </aside>
      <div class="hn-card">
        <div v-for="story in stories" :key="`v2-${story.title}`" class="hn-card__row">
          <span class="hn-card__title">{{ story.title }}</span>
          <span class="hn-card__meta">{{ story.meta }}</span>
        </div>
      </div>
    </ConceptVariant>

    <ConceptVariant tag="section" class="notice-variant" eyebrow="Variant 3" title="Left-bar accent">
      <aside class="top-notice top-notice--v3">
        <div class="top-notice__content">
          <p>Stories from April 4, 2026 (UTC)</p>
          <p>
            Go back a <a href="#">day</a>,
            <a href="#">month</a>, or
            <a href="#">year</a>.
            Go forward a <a href="#">day</a>.
          </p>
        </div>
      </aside>
      <div class="hn-card">
        <div v-for="story in stories" :key="`v3-${story.title}`" class="hn-card__row">
          <span class="hn-card__title">{{ story.title }}</span>
          <span class="hn-card__meta">{{ story.meta }}</span>
        </div>
      </div>
    </ConceptVariant>

    <ConceptVariant tag="section" class="notice-variant" eyebrow="Variant 4" title="Unified frame with notice and card sharing one wrapper">
      <div class="notice-wrapper">
        <aside class="top-notice top-notice--v4">
          <div class="top-notice__content">
            <p>Stories from April 4, 2026 (UTC)</p>
            <p>
              Go back a <a href="#">day</a>,
              <a href="#">month</a>, or
              <a href="#">year</a>.
              Go forward a <a href="#">day</a>.
            </p>
          </div>
        </aside>
        <div class="hn-card hn-card--unified">
          <div class="hn-card__inner-accent">
            <div v-for="story in stories" :key="`v4-${story.title}`" class="hn-card__row">
              <span class="hn-card__title">{{ story.title }}</span>
              <span class="hn-card__meta">{{ story.meta }}</span>
            </div>
          </div>
        </div>
      </div>
    </ConceptVariant>

    <ConceptVariant tag="section" class="notice-variant" eyebrow="Variant 5" title="Pill notice">
      <aside class="top-notice top-notice--v5">
        <div class="top-notice__content top-notice__content--pill">
          <p>Stories from April 4, 2026 (UTC)</p>
          <p>
            Go back a <a href="#">day</a>,
            <a href="#">month</a>, or
            <a href="#">year</a>.
            Go forward a <a href="#">day</a>.
          </p>
        </div>
      </aside>
      <div class="hn-card">
        <div v-for="story in stories" :key="`v5-${story.title}`" class="hn-card__row">
          <span class="hn-card__title">{{ story.title }}</span>
          <span class="hn-card__meta">{{ story.meta }}</span>
        </div>
      </div>
    </ConceptVariant>

    <ConceptVariant tag="section" class="notice-variant" eyebrow="Variant 6" title="Seamless header row inside the card">
      <div class="hn-card">
        <aside class="top-notice top-notice--v6">
          <div class="top-notice__content">
            <p>Stories from April 4, 2026 (UTC)</p>
            <p>
              Go back a <a href="#">day</a>,
              <a href="#">month</a>, or
              <a href="#">year</a>.
              Go forward a <a href="#">day</a>.
            </p>
          </div>
        </aside>
        <div v-for="story in stories" :key="`v6-${story.title}`" class="hn-card__row">
          <span class="hn-card__title">{{ story.title }}</span>
          <span class="hn-card__meta">{{ story.meta }}</span>
        </div>
      </div>
    </ConceptVariant>
  </section>
</template>

<style scoped lang="scss">
.notice-concepts {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.top-notice {
  margin-bottom: 0.4rem;
}

.top-notice__content {
  color: var(--color-text-muted);
  font-size: 0.84rem;
  line-height: 1.5;
}

.top-notice__content p {
  margin: 0;
}

.top-notice__content p + p {
  margin-top: 0.35rem;
}

.top-notice a {
  color: var(--color-accent);
  text-decoration: none;
}

.top-notice a:hover {
  text-decoration: underline;
}

.top-notice--v1 {
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 3px;
}

.top-notice--v2 {
  margin-bottom: 0.35rem;
}

.top-notice--v3 {
  padding: 0.25rem 0.5rem;
  border-left: 2px solid var(--color-border);
}

.top-notice--v4 {
  padding: 0.45rem 0.6rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.top-notice--v5 {
  display: inline-block;
  margin-bottom: 0.45rem;
  padding: 0.2rem 0.55rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
}

.top-notice__content--pill {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.top-notice--v6 {
  padding: 0.45rem 0.6rem;
  border-bottom: 1px solid var(--color-border);
}

.hn-card {
  max-width: 44rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-top: 3px solid var(--color-accent);
  border-radius: 4px;
  box-shadow: var(--shadow-elevation);
  overflow: hidden;
}

.hn-card--unified {
  border: none;
  border-top: none;
  border-radius: 0;
  box-shadow: none;
}

.hn-card__inner-accent {
  border-top: 3px solid var(--color-accent);
}

.hn-card__row {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.5rem 0.6rem;
}

.hn-card__row:not(:last-child) {
  border-bottom: 1px solid var(--color-border);
}

.hn-card__title {
  font-size: 1.02rem;
  font-weight: 600;
}

.hn-card__meta {
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.notice-wrapper {
  max-width: 44rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  box-shadow: var(--shadow-elevation);
  overflow: hidden;
}

@media (max-width: 760px) {
  .hn-card,
  .notice-wrapper {
    max-width: none;
  }
}
</style>