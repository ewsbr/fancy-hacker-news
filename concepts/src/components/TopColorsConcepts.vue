<script setup lang="ts">
import ConceptVariant from './ConceptVariant.vue';

const colors = [
  '#ff6600', '#f6f6ef', '#ffffff', '#eeeeee', '#2faced', '#009900', '#55b6f2',
  '#f0f0f0', '#ad6500', '#94c53a', '#eedf86', '#f0f0e0', '#ccdddd', '#c08000',
  '#553300', '#cbcdc6', '#229922', '#cccccc', '#880088', '#00cbff', '#ff3200',
  '#00dd00', '#b3c5b4', '#6060e0', '#5a72a0', '#000000', '#111111', '#333333',
  '#555555', '#888888', '#0066ff', '#ff6633', '#44bbff', '#bbff00', '#aa00ff',
  '#ff0066', '#00ffcc', '#ffcc00', '#336699', '#cc3311', '#006600', '#3474eb',
  '#0082a0', '#8fbc8f', '#daa520', '#dc143c', '#228b22', '#4169e1', '#ff69b4',
  '#7f00ff', '#bada55', '#c0ffee', '#facade', '#badbad', '#deaddd', '#aabbcc',
] as const;

function luminance(hex: string) {
  const red = parseInt(hex.slice(1, 3), 16) / 255;
  const green = parseInt(hex.slice(3, 5), 16) / 255;
  const blue = parseInt(hex.slice(5, 7), 16) / 255;

  const toLinear = (channel: number) => {
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * toLinear(red) + 0.7152 * toLinear(green) + 0.0722 * toLinear(blue);
}

function lighten(hex: string, amount = 0.35) {
  const red = parseInt(hex.slice(1, 3), 16);
  const green = parseInt(hex.slice(3, 5), 16);
  const blue = parseInt(hex.slice(5, 7), 16);
  const nextRed = Math.round(red + (255 - red) * amount);
  const nextGreen = Math.round(green + (255 - green) * amount);
  const nextBlue = Math.round(blue + (255 - blue) * amount);

  return `rgb(${nextRed}, ${nextGreen}, ${nextBlue})`;
}

function contrastTextColor(hex: string) {
  return luminance(hex) > 0.35 ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.9)';
}
</script>

<template>
  <section class="concept-app__section-head">
    <div>
      <p class="concept-app__section-eyebrow">top colors</p>
      <h2 class="concept-app__section-title">Eight directions for visualizing community color picks</h2>
    </div>
    <p class="concept-app__section-copy">
      These are still utility-first, but they test denser swatches, picker-like tiles, and clearer color-label pairings than the current table treatment.
    </p>
  </section>

  <section class="colors-concepts">
    <ConceptVariant tag="section" class="colors-variant" eyebrow="Variant 1" title="Swatch grid with hex labels">
      <p class="colors-variant__title">Top Colors</p>
      <div class="colors-card">
        <div class="v1-grid">
          <div v-for="hex in colors" :key="`v1-${hex}`" class="v1-swatch">
            <div class="v1-swatch__color" :style="{ background: hex }"></div>
            <span class="v1-swatch__hex">{{ hex }}</span>
          </div>
        </div>
      </div>
    </ConceptVariant>

    <ConceptVariant tag="section" class="colors-variant" eyebrow="Variant 2" title="Compact chip list">
      <p class="colors-variant__title">Top Colors</p>
      <div class="colors-card">
        <div class="v2-chips">
          <span v-for="hex in colors" :key="`v2-${hex}`" class="v2-chip">
            <span class="v2-chip__dot" :style="{ background: hex }"></span>
            {{ hex }}
          </span>
        </div>
      </div>
    </ConceptVariant>

    <ConceptVariant tag="section" class="colors-variant" eyebrow="Variant 3" title="Wide bar list">
      <p class="colors-variant__title">Top Colors</p>
      <div class="colors-card">
        <div class="v3-list">
          <div v-for="hex in colors" :key="`v3-${hex}`" class="v3-row">
            <div class="v3-bar" :style="{ background: hex }"></div>
            <span class="v3-hex">{{ hex }}</span>
          </div>
        </div>
      </div>
    </ConceptVariant>

    <ConceptVariant tag="section" class="colors-variant" eyebrow="Variant 4" title="Dense mosaic tiles">
      <p class="colors-variant__title">Top Colors</p>
      <div class="colors-card">
        <div class="v4-mosaic">
          <div v-for="hex in colors" :key="`v4-${hex}`" class="v4-tile" :data-hex="hex" :style="{ background: hex }" :title="hex"></div>
        </div>
      </div>
    </ConceptVariant>

    <ConceptVariant tag="section" class="colors-variant" eyebrow="Variant 5" title="Improved table">
      <p class="colors-variant__title">Top Colors</p>
      <div class="colors-card">
        <table class="v5-table">
          <tbody>
            <tr v-for="hex in colors" :key="`v5-${hex}`">
              <td class="v5-hex-cell">{{ hex }}</td>
              <td class="v5-color-cell" :style="{ background: hex }"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </ConceptVariant>

    <ConceptVariant tag="section" class="colors-variant" eyebrow="Variant 6" title="Theme-picker card grid">
      <p class="colors-variant__title">Top Colors</p>
      <div class="colors-card">
        <div class="v6-grid">
          <div v-for="hex in colors" :key="`v6-${hex}`" class="v6-card">
            <div class="v6-card__circle" :style="{ background: hex }"></div>
            <span class="v6-card__hex">{{ hex }}</span>
          </div>
        </div>
      </div>
    </ConceptVariant>

    <ConceptVariant tag="section" class="colors-variant" eyebrow="Variant 7" title="Diagonal-split tiles">
      <p class="colors-variant__title">Top Colors</p>
      <div class="colors-card">
        <div class="v7-grid">
          <div
            v-for="hex in colors"
            :key="`v7-${hex}`"
            class="v7-tile"
            :style="{ background: `linear-gradient(135deg, ${hex} 50%, ${lighten(hex)} 50%)` }"
            :title="hex"
          >
            <span class="v7-tile__hex">{{ hex }}</span>
          </div>
        </div>
      </div>
    </ConceptVariant>

    <ConceptVariant tag="section" class="colors-variant" eyebrow="Variant 8" title="Full-fill tiles with auto-contrast labels">
      <p class="colors-variant__title">Top Colors</p>
      <div class="colors-card colors-card--flush">
        <div class="v8-grid">
          <div v-for="hex in colors" :key="`v8-${hex}`" class="v8-tile" :style="{ background: hex, color: contrastTextColor(hex) }">
            {{ hex }}
          </div>
        </div>
      </div>
    </ConceptVariant>
  </section>
</template>

<style scoped lang="scss">
.colors-concepts {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.colors-variant__title {
  margin: 0 0 1.25rem;
  font-family: var(--font-title);
  font-size: 1.25rem;
  font-weight: 700;
}

.colors-card {
  max-width: 64rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-top: 3px solid var(--color-accent);
  border-radius: 4px;
  box-shadow: var(--shadow-elevation);
  overflow: hidden;
}

.colors-card--flush {
  overflow: hidden;
}

.v1-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr));
  gap: 0.75rem;
  padding: 1rem;
}

.v1-swatch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.v1-swatch__color {
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.v1-swatch__hex,
.v3-hex,
.v5-hex-cell,
.v6-card__hex,
.v7-tile__hex,
.v8-tile,
.v2-chip {
  font-family: var(--font-mono);
}

.v1-swatch__hex {
  color: var(--color-text-muted);
  font-size: 0.68rem;
  letter-spacing: 0.02em;
}

.v2-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 1rem;
}

.v2-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.5rem 0.2rem 0.3rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 0.72rem;
}

.v2-chip__dot {
  width: 0.9rem;
  height: 0.9rem;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
}

.v3-list {
  display: flex;
  flex-direction: column;
}

.v3-row {
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid var(--color-border);
}

.v3-row:last-child {
  border-bottom: none;
}

.v3-row:hover .v3-bar {
  opacity: 0.92;
}

.v3-bar {
  width: 3rem;
  flex-shrink: 0;
}

.v3-hex {
  flex: 1;
  align-self: center;
  padding: 0.3rem 0.75rem;
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

.v4-mosaic {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(3rem, 1fr));
  gap: 2px;
  padding: 2px;
}

.v4-tile {
  position: relative;
  aspect-ratio: 1;
  border-radius: 2px;
}

.v4-tile:hover::after {
  content: attr(data-hex);
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: 700;
  text-align: center;
}

.v5-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
}

.v5-table td {
  border-bottom: 1px solid var(--color-border);
}

.v5-table tr:last-child td {
  border-bottom: none;
}

.v5-hex-cell {
  width: 6rem;
  padding: 0.3rem 0.75rem;
  white-space: nowrap;
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

.v5-color-cell {
  width: 100%;
  height: 1.75rem;
  padding: 0;
}

.v6-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(4.5rem, 1fr));
  gap: 0.45rem;
  padding: 0.75rem;
}

.v6-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 0.35rem 0.45rem;
  border: 2px solid transparent;
  border-radius: 4px;
  background: color-mix(in srgb, var(--color-surface) 80%, var(--color-bg) 20%);
}

.v6-card:hover {
  border-color: color-mix(in srgb, var(--color-accent) 40%, transparent);
}

.v6-card__circle {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  box-shadow: 0 0 0 1.5px var(--color-border);
}

.v6-card__hex {
  color: var(--color-text-muted);
  font-size: 0.62rem;
  line-height: 1.2;
  text-align: center;
  word-break: break-all;
}

.v7-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(3.5rem, 1fr));
  gap: 0.35rem;
  padding: 0.75rem;
}

.v7-tile {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 5px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
}

.v7-tile__hex {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding: 0.2rem 0.25rem;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.55rem;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.7);
  opacity: 0;
  transition: opacity 120ms ease;
}

.v7-tile:hover .v7-tile__hex {
  opacity: 1;
}

.v8-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr));
  gap: 0;
}

.v8-tile {
  position: relative;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 4 / 3;
  border: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 0.68rem;
  font-weight: 600;
  transition: transform 100ms ease;
}

.v8-tile:hover {
  z-index: 1;
  transform: scale(1.05);
}

@media (max-width: 760px) {
  .colors-card {
    max-width: none;
  }
}
</style>