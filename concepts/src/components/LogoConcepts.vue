<script setup lang="ts">
import ConceptVariant from './ConceptVariant.vue';

const sizes = [16, 24, 40, 64] as const;

const variants = [
  {
    id: 'mono-tile',
    name: 'Mono Tile',
    mood: 'toolbar-ready',
    glyph: 'fh',
    note: 'Dense lowercase monogram in a square tile. This is the closest to a direct browser-action icon: compact, legible, and friendly to tiny sizes.',
  },
  {
    id: 'split-beam',
    name: 'Split Beam',
    mood: 'modernist',
    glyph: 'fh',
    note: 'Same basic monogram, but cut by a diagonal beam so it feels less like a generic app badge and more like a designed mark.',
  },
  {
    id: 'split-ember',
    name: 'Split Ember',
    mood: 'two-tone monogram',
    glyph: 'FH',
    note: 'Built from the Mono Tile palette and the Split Beam silhouette: no white seam, just a diagonal split between bright orange and a weaker orange with a white uppercase monogram.',
  },
  {
    id: 'upvote-badge',
    name: 'Upvote Badge',
    mood: 'closest to HN behavior',
    glyph: '',
    note: 'Drops letters entirely and leans on the single most recognizable HN affordance: the upvote arrow. Simple enough to survive favicon-scale rendering.',
  },
  {
    id: 'thread-bracket',
    name: 'Thread Bracket',
    mood: 'comment-heavy',
    glyph: 'h',
    note: 'Uses bracket corners and a stem that hints at nested comment threads. More editorial, less app-store generic.',
  },
  {
    id: 'story-stack',
    name: 'Story Stack',
    mood: 'feed-first',
    glyph: '',
    note: 'Three story rows and a rank pin reduced to geometry. If the extension is mostly about making lists feel better, this direction says that immediately.',
  },
  {
    id: 'terminal-prompt',
    name: 'Terminal Prompt',
    mood: 'hackerish',
    glyph: '>_',
    note: 'A mono prompt badge with just enough polish to avoid feeling like a dev-tool parody. Best if you want the extension to feel technical and sharp.',
  },
  {
    id: 'folded-page',
    name: 'Folded Page',
    mood: 'publishing',
    glyph: 'hn',
    note: 'Reads like a tiny front page with a folded corner. Keeps the mark simple while nodding to the idea of reading, posts, and daily browsing.',
  },
  {
    id: 'pixel-grid',
    name: 'Pixel Grid',
    mood: 'retro web',
    glyph: '',
    note: 'A tiny matrix with one missing pixel. More abstract than the others, but it has good rhythm at small sizes and feels internet-native.',
  },
  {
    id: 'signal-frame',
    name: 'Signal Frame',
    mood: 'premium',
    glyph: 'hn',
    note: 'An outlined frame with a small signal burst. Slightly more polished and product-like, while still keeping the mark down to a few primitives.',
  },
] as const;

function markStyle(size: number) {
  return { '--logo-size': `${size}px` };
}
</script>

<template>
  <section class="concept-app__section-head">
    <div>
      <p class="concept-app__section-eyebrow">logo</p>
      <h2 class="concept-app__section-title">Ten simple icon directions for the extension</h2>
    </div>
    <p class="concept-app__section-copy">
      These stay intentionally minimal: HTML + CSS only, built to be judged at browser-action sizes rather than as giant marketing illustrations. The strongest small-size candidates are Mono Tile, Split Ember, Upvote Badge, and Folded Page.
    </p>
  </section>

  <section class="logo-concepts">
    <ConceptVariant v-for="(variant, index) in variants" :key="variant.id" class="logo-card" :eyebrow="`Variant ${index + 1}`" :title="variant.name">
      <template #title-trailing>
        <span class="logo-card__chip">{{ variant.mood }}</span>
        <span class="logo-card__chip">{{ variant.id }}</span>
      </template>

      <template #description>
        <p class="logo-card__note">{{ variant.note }}</p>
      </template>

      <div class="logo-card__showcase">
        <div class="logo-card__hero">
          <div class="logo-card__hero-stage">
            <span class="logo-mark logo-mark--hero" :class="`logo-mark--${variant.id}`" :style="markStyle(112)">
              <span class="logo-mark__glyph">{{ variant.glyph }}</span>
              <span class="logo-mark__detail logo-mark__detail--one"></span>
              <span class="logo-mark__detail logo-mark__detail--two"></span>
              <span class="logo-mark__detail logo-mark__detail--three"></span>
            </span>

            <div class="logo-wordmark" :class="`logo-wordmark--${variant.id}`">
              <span class="logo-wordmark__eyebrow">Fancy HackerNews</span>
              <span class="logo-wordmark__name">{{ variant.name }}</span>
              <span class="logo-wordmark__sub">CSS-only mark study for toolbar and store icon sizes</span>
            </div>
          </div>
        </div>

        <div class="logo-card__sizes" aria-label="size previews">
          <div v-for="size in sizes" :key="`${variant.id}-${size}`" class="logo-size-chip">
            <div class="logo-size-chip__stage">
              <span class="logo-mark" :class="`logo-mark--${variant.id}`" :style="markStyle(size)">
                <span class="logo-mark__glyph">{{ variant.glyph }}</span>
                <span class="logo-mark__detail logo-mark__detail--one"></span>
                <span class="logo-mark__detail logo-mark__detail--two"></span>
                <span class="logo-mark__detail logo-mark__detail--three"></span>
              </span>
            </div>
            <span class="logo-size-chip__label">{{ size }}px</span>
          </div>
        </div>
      </div>
    </ConceptVariant>
  </section>
</template>

<style scoped lang="scss">
.logo-concepts {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.logo-card {
  gap: 0;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--color-surface) 88%, transparent) 0%, var(--color-surface) 100%);
  border: 1px solid var(--color-border);
  border-top: 3px solid var(--color-accent);
  border-radius: 1.25rem;
  box-shadow: var(--shadow-elevation);
  overflow: hidden;
}

.logo-card :deep(.concept-variant-shell__header) {
  display: grid;
  gap: 0.85rem;
  padding: 1.2rem 1.25rem 1rem;
  border-bottom: 1px solid color-mix(in srgb, var(--color-border) 82%, transparent);
}

.logo-card :deep(.concept-variant-shell__eyebrow) {
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.logo-card :deep(.concept-variant-shell__title) {
  font-family: var(--font-title);
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.05;
}

.logo-card :deep(.concept-variant-shell__description) {
  margin-top: 0;
}

.logo-card__chip {
  display: inline-flex;
  align-items: center;
  min-height: 1.85rem;
  padding: 0.2rem 0.65rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 0.72rem;
}

.logo-card__showcase {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  padding: 1rem 1.25rem 1.25rem;
}

.logo-card__hero {
  min-width: 0;
}

.logo-card__hero-stage {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 1.25rem;
  align-items: center;
  min-height: 100%;
  padding: 1.15rem;
  border: 1px dashed color-mix(in srgb, var(--color-border) 80%, transparent);
  border-radius: 1rem;
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--color-accent) 12%, transparent) 0, transparent 35%),
    linear-gradient(180deg, color-mix(in srgb, var(--color-surface) 65%, transparent), transparent);
}

.logo-wordmark {
  display: grid;
  gap: 0.3rem;
  min-width: 0;
}

.logo-wordmark__eyebrow {
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.logo-wordmark__name {
  font-family: var(--font-title);
  font-size: clamp(1.45rem, 3vw, 2.5rem);
  font-weight: 800;
  line-height: 0.95;
}

.logo-wordmark__sub {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.logo-card__sizes {
  display: grid;
  grid-template-columns: repeat(2, minmax(6.5rem, 1fr));
  gap: 0.75rem;
  align-content: start;
}

.logo-size-chip {
  display: grid;
  gap: 0.55rem;
}

.logo-size-chip__stage {
  display: grid;
  place-items: center;
  min-height: 6rem;
  padding: 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--color-bg) 45%, var(--color-surface) 55%);
}

.logo-size-chip__label {
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  text-align: center;
}

.logo-mark {
  --logo-size: 64px;
  --logo-ink: var(--color-accent);
  --logo-paper: var(--color-surface);
  --logo-outline: color-mix(in srgb, var(--color-border) 72%, var(--color-text) 28%);
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--logo-size);
  height: var(--logo-size);
  flex: 0 0 var(--logo-size);
  color: var(--logo-ink);
}

.logo-mark::before,
.logo-mark::after,
.logo-mark__detail {
  position: absolute;
  display: block;
  content: '';
}

.logo-mark__glyph {
  position: relative;
  z-index: 1;
  font-family: var(--font-title);
  font-size: calc(var(--logo-size) * 0.42);
  font-weight: 800;
  letter-spacing: -0.09em;
  line-height: 1;
  text-transform: lowercase;
}

.logo-mark--hero {
  --logo-size: 112px;
}

.logo-mark--mono-tile {
  border-radius: calc(var(--logo-size) * 0.2);
  background: var(--logo-ink);
  color: white;
  box-shadow: inset 0 -1px 0 color-mix(in srgb, black 18%, transparent);
}

.logo-mark--mono-tile::after {
  right: calc(var(--logo-size) * 0.14);
  bottom: calc(var(--logo-size) * 0.14);
  width: calc(var(--logo-size) * 0.16);
  height: calc(var(--logo-size) * 0.08);
  border-radius: 999px;
  background: color-mix(in srgb, white 72%, transparent);
}

.logo-mark--split-beam {
  border-radius: calc(var(--logo-size) * 0.22);
  background: linear-gradient(135deg, var(--logo-ink) 0 44%, #ffffff 44% 56%, color-mix(in srgb, var(--logo-paper) 88%, var(--logo-ink) 12%) 56% 100%);
  color: color-mix(in srgb, var(--color-text) 82%, white 18%);
  border: 1px solid color-mix(in srgb, var(--logo-ink) 22%, var(--color-border) 78%);
}

.logo-mark--split-beam .logo-mark__glyph {
  transform: translateY(calc(var(--logo-size) * -0.01));
  color: color-mix(in srgb, var(--color-text) 78%, white 22%);
}

.logo-mark--split-beam::after {
  inset: calc(var(--logo-size) * 0.11);
  border-radius: calc(var(--logo-size) * 0.14);
  border: 1px solid color-mix(in srgb, var(--color-text) 8%, transparent);
}

.logo-mark--split-ember {
  border-radius: calc(var(--logo-size) * 0.22);
  background: linear-gradient(135deg, var(--logo-ink) 0 49%, color-mix(in srgb, var(--logo-ink) 56%, var(--logo-paper) 44%) 49% 100%);
  color: white;
  border: 1px solid color-mix(in srgb, var(--logo-ink) 24%, var(--color-border) 76%);
  box-shadow: inset 0 -1px 0 color-mix(in srgb, black 14%, transparent);
}

.logo-mark--split-ember .logo-mark__glyph {
  color: white;
  font-size: calc(var(--logo-size) * 0.34);
  font-weight: 900;
  letter-spacing: -0.06em;
  text-transform: uppercase;
}

.logo-mark--split-ember::after {
  inset: calc(var(--logo-size) * 0.11);
  border-radius: calc(var(--logo-size) * 0.14);
  border: 1px solid color-mix(in srgb, white 16%, transparent);
}

.logo-mark--upvote-badge {
  border-radius: calc(var(--logo-size) * 0.22);
  background: var(--logo-ink);
}

.logo-mark--upvote-badge .logo-mark__glyph {
  opacity: 0;
}

.logo-mark--upvote-badge::before {
  top: calc(var(--logo-size) * 0.2);
  width: calc(var(--logo-size) * 0.34);
  height: calc(var(--logo-size) * 0.34);
  background: white;
  clip-path: polygon(50% 0, 100% 62%, 72% 62%, 72% 100%, 28% 100%, 28% 62%, 0 62%);
}

.logo-mark--upvote-badge::after {
  bottom: calc(var(--logo-size) * 0.19);
  width: calc(var(--logo-size) * 0.42);
  height: calc(var(--logo-size) * 0.08);
  border-radius: 999px;
  background: color-mix(in srgb, white 82%, transparent);
}

.logo-mark--thread-bracket {
  border-radius: calc(var(--logo-size) * 0.2);
  background: color-mix(in srgb, var(--logo-paper) 94%, var(--logo-ink) 6%);
  border: 2px solid var(--logo-ink);
}

.logo-mark--thread-bracket .logo-mark__glyph {
  font-size: calc(var(--logo-size) * 0.5);
  transform: translateX(calc(var(--logo-size) * -0.03));
}

.logo-mark--thread-bracket::before {
  left: calc(var(--logo-size) * 0.18);
  top: calc(var(--logo-size) * 0.2);
  bottom: calc(var(--logo-size) * 0.2);
  width: calc(var(--logo-size) * 0.1);
  border-left: calc(var(--logo-size) * 0.06) solid var(--logo-ink);
  border-top: calc(var(--logo-size) * 0.06) solid var(--logo-ink);
  border-bottom: calc(var(--logo-size) * 0.06) solid var(--logo-ink);
  border-radius: calc(var(--logo-size) * 0.08) 0 0 calc(var(--logo-size) * 0.08);
}

.logo-mark--thread-bracket::after {
  right: calc(var(--logo-size) * 0.18);
  top: calc(var(--logo-size) * 0.2);
  width: calc(var(--logo-size) * 0.1);
  height: calc(var(--logo-size) * 0.6);
  border-right: calc(var(--logo-size) * 0.06) solid var(--logo-ink);
  border-top: calc(var(--logo-size) * 0.06) solid var(--logo-ink);
  border-radius: 0 calc(var(--logo-size) * 0.08) 0 0;
}

.logo-mark--story-stack {
  border-radius: calc(var(--logo-size) * 0.2);
  background: var(--logo-paper);
  border: 1px solid var(--logo-outline);
}

.logo-mark--story-stack .logo-mark__glyph {
  opacity: 0;
}

.logo-mark--story-stack::before {
  left: calc(var(--logo-size) * 0.18);
  top: calc(var(--logo-size) * 0.23);
  width: calc(var(--logo-size) * 0.12);
  height: calc(var(--logo-size) * 0.12);
  border-radius: 50%;
  background: var(--logo-ink);
  box-shadow:
    0 calc(var(--logo-size) * 0.18) 0 0 color-mix(in srgb, var(--logo-ink) 82%, transparent),
    0 calc(var(--logo-size) * 0.36) 0 0 color-mix(in srgb, var(--logo-ink) 58%, transparent);
}

.logo-mark--story-stack::after {
  left: calc(var(--logo-size) * 0.36);
  top: calc(var(--logo-size) * 0.22);
  width: calc(var(--logo-size) * 0.42);
  height: calc(var(--logo-size) * 0.09);
  border-radius: 999px;
  background: color-mix(in srgb, var(--logo-ink) 94%, var(--logo-paper) 6%);
  box-shadow:
    0 calc(var(--logo-size) * 0.18) 0 0 color-mix(in srgb, var(--logo-ink) 64%, var(--logo-paper) 36%),
    0 calc(var(--logo-size) * 0.36) 0 0 color-mix(in srgb, var(--logo-ink) 42%, var(--logo-paper) 58%);
}

.logo-mark--terminal-prompt {
  border-radius: calc(var(--logo-size) * 0.18);
  background: color-mix(in srgb, var(--color-text) 92%, black 8%);
  color: #b7ffd9;
  border: 1px solid color-mix(in srgb, white 10%, transparent);
}

.logo-mark--terminal-prompt .logo-mark__glyph {
  font-family: var(--font-mono);
  font-size: calc(var(--logo-size) * 0.34);
  letter-spacing: -0.08em;
}

.logo-mark--terminal-prompt::before {
  top: calc(var(--logo-size) * 0.14);
  left: calc(var(--logo-size) * 0.14);
  right: calc(var(--logo-size) * 0.14);
  height: calc(var(--logo-size) * 0.1);
  border-radius: 999px;
  background: color-mix(in srgb, white 18%, transparent);
}

.logo-mark--terminal-prompt::after {
  right: calc(var(--logo-size) * 0.18);
  bottom: calc(var(--logo-size) * 0.17);
  width: calc(var(--logo-size) * 0.12);
  height: calc(var(--logo-size) * 0.12);
  border-radius: 50%;
  background: #ffd36c;
}

.logo-mark--folded-page {
  border-radius: calc(var(--logo-size) * 0.16);
  background: var(--logo-paper);
  color: var(--logo-ink);
  border: 2px solid var(--logo-ink);
}

.logo-mark--folded-page .logo-mark__glyph {
  font-size: calc(var(--logo-size) * 0.31);
  letter-spacing: -0.06em;
}

.logo-mark--folded-page::before {
  top: calc(var(--logo-size) * -0.02);
  right: calc(var(--logo-size) * -0.02);
  width: calc(var(--logo-size) * 0.34);
  height: calc(var(--logo-size) * 0.34);
  background: linear-gradient(135deg, transparent 0 49%, var(--logo-ink) 49% 51%, color-mix(in srgb, var(--logo-ink) 18%, var(--logo-paper) 82%) 51% 100%);
  clip-path: polygon(100% 0, 100% 100%, 0 0);
  border-top-right-radius: calc(var(--logo-size) * 0.1);
}

.logo-mark--folded-page::after {
  inset: calc(var(--logo-size) * 0.18) calc(var(--logo-size) * 0.18) calc(var(--logo-size) * 0.18) calc(var(--logo-size) * 0.18);
  border: 1px solid color-mix(in srgb, var(--logo-ink) 28%, transparent);
  border-radius: calc(var(--logo-size) * 0.05);
}

.logo-mark--pixel-grid {
  border-radius: calc(var(--logo-size) * 0.16);
  background: var(--logo-ink);
}

.logo-mark--pixel-grid .logo-mark__glyph {
  opacity: 0;
}

.logo-mark--pixel-grid::before {
  top: calc(var(--logo-size) * 0.18);
  left: calc(var(--logo-size) * 0.18);
  width: calc(var(--logo-size) * 0.14);
  height: calc(var(--logo-size) * 0.14);
  background: white;
  box-shadow:
    calc(var(--logo-size) * 0.2) 0 0 white,
    calc(var(--logo-size) * 0.4) 0 0 white,
    0 calc(var(--logo-size) * 0.2) 0 white,
    calc(var(--logo-size) * 0.2) calc(var(--logo-size) * 0.2) 0 white,
    calc(var(--logo-size) * 0.4) calc(var(--logo-size) * 0.2) 0 color-mix(in srgb, white 40%, transparent),
    0 calc(var(--logo-size) * 0.4) 0 white,
    calc(var(--logo-size) * 0.2) calc(var(--logo-size) * 0.4) 0 white,
    calc(var(--logo-size) * 0.4) calc(var(--logo-size) * 0.4) 0 white;
}

.logo-mark--signal-frame {
  border-radius: calc(var(--logo-size) * 0.22);
  background: color-mix(in srgb, var(--logo-paper) 92%, var(--logo-ink) 8%);
  border: 2px solid color-mix(in srgb, var(--logo-ink) 85%, var(--color-border) 15%);
}

.logo-mark--signal-frame .logo-mark__glyph {
  font-size: calc(var(--logo-size) * 0.28);
  letter-spacing: -0.04em;
}

.logo-mark--signal-frame::before {
  inset: calc(var(--logo-size) * 0.14);
  border: 1px solid color-mix(in srgb, var(--logo-ink) 28%, transparent);
  border-radius: calc(var(--logo-size) * 0.12);
}

.logo-mark--signal-frame::after {
  top: calc(var(--logo-size) * 0.18);
  right: calc(var(--logo-size) * 0.18);
  width: calc(var(--logo-size) * 0.1);
  height: calc(var(--logo-size) * 0.1);
  border-radius: 50%;
  background: var(--logo-ink);
  box-shadow:
    calc(var(--logo-size) * -0.12) calc(var(--logo-size) * 0.04) 0 color-mix(in srgb, var(--logo-ink) 76%, transparent),
    calc(var(--logo-size) * -0.24) calc(var(--logo-size) * 0.08) 0 color-mix(in srgb, var(--logo-ink) 44%, transparent);
}

.logo-wordmark--terminal-prompt .logo-wordmark__name {
  font-family: var(--font-mono);
  letter-spacing: -0.04em;
}

.logo-wordmark--pixel-grid .logo-wordmark__name,
.logo-wordmark--signal-frame .logo-wordmark__name {
  letter-spacing: -0.05em;
}

@media (max-width: 768px) {
  .logo-card__showcase {
    grid-template-columns: 1fr;
  }

  .logo-card__sizes {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .logo-card {
    border-radius: 1rem;
  }

  .logo-card :deep(.concept-variant-shell__header),
  .logo-card__showcase {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .logo-card__hero-stage {
    grid-template-columns: 1fr;
    justify-items: start;
  }

  .logo-card__sizes {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>