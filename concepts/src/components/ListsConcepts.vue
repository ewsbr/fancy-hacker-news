<script setup lang="ts">
import ConceptVariant from './ConceptVariant.vue';

const entries = [
  { name: 'front', href: 'front', desc: 'Front page submissions for a given day (e.g. <a href="#">2016-06-20</a>)' },
  { name: 'pool', href: 'pool', desc: 'Links selected for a <a href="#">second chance</a> at the front page' },
  { name: 'invited', href: 'invited', desc: 'Overlooked links, invited to repost' },
  { name: 'highlights', href: 'highlights', desc: 'Particularly good comments from over the years' },
  { name: 'shownew', href: 'shownew', desc: 'The newest <a href="#">Show HN</a> posts' },
  { name: 'asknew', href: 'asknew', desc: 'The newest <a href="#">Ask HN</a> (text) posts' },
  { name: 'best', href: 'best', desc: 'Highest-voted recent links' },
  { name: 'bestcomments', href: 'bestcomments', desc: 'Highest-voted recent comments' },
  { name: 'active', href: 'active', desc: 'Most active current discussions' },
  { name: 'noobstories', href: 'noobstories', desc: 'Submissions from new accounts' },
  { name: 'noobcomments', href: 'noobcomments', desc: 'Comments from new accounts' },
  { name: 'classic', href: 'classic', desc: 'Frontpage as voted by ancient accounts' },
  { name: 'leaders', href: 'leaders', desc: 'Users with most karma' },
  { name: 'topcolors', href: 'topcolors', desc: 'A sampler of <a href="#">topcolors</a> chosen by active users' },
  { name: 'whoishiring', href: 'submitted?id=whoishiring', desc: 'Monthly "Who Is Hiring" threads' },
  { name: 'launches', href: 'launches', desc: 'Launches of YC startups' },
] as const;
</script>

<template>
  <section class="concept-app__section-head">
    <div>
      <p class="concept-app__section-eyebrow">lists page</p>
      <h2 class="concept-app__section-title">Five directions based on the current lists page</h2>
    </div>
    <p class="concept-app__section-copy">
      These stay close to the current lists utility page: compact rows, simple separators, accent links, and a restrained card shell.
    </p>
  </section>

  <section class="lists-concepts">
    <ConceptVariant tag="section" class="lists-variant" eyebrow="Variant 1" title="Current grid, monospace link, muted description">
      <p class="lists-variant__title">Lists</p>
      <div class="lists-card">
        <div class="v1-grid">
          <template v-for="entry in entries" :key="`v1-${entry.name}`">
            <a class="v1-name" :href="entry.href">{{ entry.name }}</a>
            <div class="v1-desc lists-desc" v-html="entry.desc"></div>
          </template>
        </div>
      </div>
    </ConceptVariant>

    <ConceptVariant tag="section" class="lists-variant" eyebrow="Variant 2" title="Compact table, alternating rows, hard column split">
      <p class="lists-variant__title">Lists</p>
      <div class="lists-card">
        <table class="v2-table">
          <tbody>
            <tr v-for="entry in entries" :key="`v2-${entry.name}`">
              <td class="v2-name-cell"><a :href="entry.href">{{ entry.name }}</a></td>
              <td class="v2-desc-cell lists-desc" v-html="entry.desc"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </ConceptVariant>

    <ConceptVariant tag="section" class="lists-variant" eyebrow="Variant 3" title="Fixed name rail, sans-serif emphasis">
      <p class="lists-variant__title">Lists</p>
      <div class="lists-card">
        <div class="v3-grid">
          <template v-for="entry in entries" :key="`v3-${entry.name}`">
            <div class="v3-name"><a :href="entry.href">{{ entry.name }}</a></div>
            <div class="v3-desc lists-desc" v-html="entry.desc"></div>
          </template>
        </div>
      </div>
    </ConceptVariant>

    <ConceptVariant tag="section" class="lists-variant" eyebrow="Variant 4" title="Hover rows, name plus separator plus description">
      <p class="lists-variant__title">Lists</p>
      <div class="lists-card">
        <div class="v4-list">
          <div v-for="entry in entries" :key="`v4-${entry.name}`" class="v4-row">
            <a class="v4-name" :href="entry.href">{{ entry.name }}</a>
            <span class="v4-sep">&mdash;</span>
            <span class="v4-desc lists-desc" v-html="entry.desc"></span>
          </div>
        </div>
      </div>
    </ConceptVariant>

    <ConceptVariant tag="section" class="lists-variant" eyebrow="Variant 5" title="Flat inline rows with no dividers">
      <p class="lists-variant__title">Lists</p>
      <div class="lists-card">
        <div class="v5-list">
          <div v-for="entry in entries" :key="`v5-${entry.name}`" class="v5-row">
            <a class="v5-name" :href="entry.href">{{ entry.name }}</a>
            <span class="v5-dash">&mdash;</span>
            <span class="v5-desc lists-desc" v-html="entry.desc"></span>
          </div>
        </div>
      </div>
    </ConceptVariant>
  </section>
</template>

<style scoped lang="scss">
.lists-concepts {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.lists-variant__title {
  margin: 0 0 1.25rem;
  font-family: var(--font-title);
  font-size: 1.25rem;
  font-weight: 700;
}

.lists-card {
  max-width: 44rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-top: 3px solid var(--color-accent);
  border-radius: 4px;
  box-shadow: var(--shadow-elevation);
  overflow: hidden;
}

.lists-desc :deep(a) {
  color: var(--color-accent);
  text-decoration: none;
}

.lists-desc :deep(a:hover) {
  text-decoration: underline;
}

.v1-grid {
  display: grid;
  grid-template-columns: max-content 1fr;
}

.v1-name,
.v1-desc {
  padding: 0.45rem 0.75rem;
  font-size: 0.9rem;
  line-height: 1.5;
  border-bottom: 1px solid var(--color-border);
}

.v1-name:nth-last-child(-n + 2),
.v1-desc:nth-last-child(-n + 2) {
  border-bottom: none;
}

.v1-name {
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
}

.v1-desc {
  padding-left: 0;
  color: var(--color-text-muted);
}

.v2-table {
  width: 100%;
  border-collapse: collapse;
}

.v2-table tr:nth-child(even) td {
  background: color-mix(in srgb, var(--color-surface) 96%, var(--color-text) 4%);
}

.v2-table td {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.45;
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.v2-table tr:last-child td {
  border-bottom: none;
}

.v2-name-cell {
  white-space: nowrap;
  border-right: 1px solid var(--color-border);
}

.v2-name-cell a {
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
}

.v2-name-cell a:hover {
  text-decoration: underline;
}

.v2-desc-cell {
  color: var(--color-text-muted);
}

.v3-grid {
  display: grid;
  grid-template-columns: 8.5rem 1fr;
}

.v3-name,
.v3-desc {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
  line-height: 1.5;
}

.v3-name:nth-last-child(-n + 2),
.v3-desc:nth-last-child(-n + 2) {
  border-bottom: none;
}

.v3-name {
  display: flex;
  align-items: center;
  border-right: 1px solid var(--color-border);
  color: var(--color-accent);
  font-size: 0.875rem;
  font-weight: 600;
}

.v3-name a {
  color: inherit;
  text-decoration: none;
}

.v3-name a:hover {
  text-decoration: underline;
}

.v3-desc {
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.v4-list {
  display: flex;
  flex-direction: column;
}

.v4-row {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.v4-row:last-child {
  border-bottom: none;
}

.v4-row:hover {
  background: color-mix(in srgb, var(--color-surface) 95%, var(--color-text) 5%);
}

.v4-name {
  min-width: 8rem;
  flex-shrink: 0;
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
}

.v4-name:hover {
  text-decoration: underline;
}

.v4-sep {
  color: var(--color-border);
  flex-shrink: 0;
}

.v4-desc {
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.v5-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
}

.v5-row {
  font-size: 0.9rem;
  line-height: 1.5;
}

.v5-name {
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
}

.v5-name:hover {
  text-decoration: underline;
}

.v5-dash {
  margin: 0 0.3rem;
  color: var(--color-border);
}

.v5-desc {
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

@media (max-width: 760px) {
  .lists-card {
    max-width: none;
  }

  .v4-row {
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .v4-name {
    min-width: auto;
  }
}
</style>