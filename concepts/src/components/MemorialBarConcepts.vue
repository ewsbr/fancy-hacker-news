<script setup lang="ts">
// static concepts component — all variants respond to the active theme via CSS variables
</script>

<template>
  <section class="concept-app__section-head">
    <div>
      <p class="concept-app__section-eyebrow">memorial bar</p>
      <h2 class="concept-app__section-title">Approaches to the mourning indicator</h2>
    </div>
    <p class="concept-app__section-copy">
      HN shows a plain black bar at the page top when someone notable passes — no text, no name.
      These variants adapt that convention for multiple themes. Switch themes to evaluate each one.
    </p>
  </section>

  <section class="memorial-concepts">

    <!-- ─── V1: Hairline ──────────────────────────────────────────────────── -->
    <section class="memorial-variant">
      <h3>Variant 1 — Hairline</h3>
      <p class="memorial-variant__desc">
        A 4 px stripe pinned above the header, drawn from
        <code>var(--color-text)</code>. Near-black on light themes; near-white on dark themes —
        always contrasting, never hardcoded. The closest equivalent to HN's original black bar.
      </p>
      <div class="demo-site demo-site--hairline">
        <div class="demo-header">
          <span class="demo-logo">Y</span>
          <span class="demo-site-name">Hacker News</span>
          <span class="demo-nav">new · ask · show</span>
        </div>
        <div class="demo-stories">
          <div class="demo-story">Rust 2025 Edition release notes</div>
          <div class="demo-story">Ask HN: How do you handle burnout?</div>
          <div class="demo-story">The anatomy of a fast compiler</div>
        </div>
      </div>
    </section>

    <!-- ─── V2: Greyed accent ─────────────────────────────────────────────── -->
    <section class="memorial-variant">
      <h3>Variant 2 — Greyed accent</h3>
      <p class="memorial-variant__desc">
        The header bar is desaturated with <code>filter: grayscale(1)</code>. The signature brand
        colour disappears entirely — orange, teal, or otherwise. Regular users notice immediately;
        new visitors have no frame of reference.
      </p>
      <div class="demo-site demo-site--grey-header">
        <div class="demo-header">
          <span class="demo-logo">Y</span>
          <span class="demo-site-name">Hacker News</span>
          <span class="demo-nav">new · ask · show</span>
        </div>
        <div class="demo-stories">
          <div class="demo-story">Rust 2025 Edition release notes</div>
          <div class="demo-story">Ask HN: How do you handle burnout?</div>
          <div class="demo-story">The anatomy of a fast compiler</div>
        </div>
      </div>
    </section>

    <!-- ─── V3: Muted wide rule ───────────────────────────────────────────── -->
    <section class="memorial-variant">
      <h3>Variant 3 — Muted wide rule</h3>
      <p class="memorial-variant__desc">
        The header's accent overline is widened to 7 px and recoloured to
        <code>var(--color-text-muted)</code>. The brand colour stays in the logo; only its
        structural frame shifts to a sombre neutral. Reads as deliberate restraint, not a bug.
      </p>
      <div class="demo-site demo-site--muted-rule">
        <div class="demo-header">
          <span class="demo-logo">Y</span>
          <span class="demo-site-name">Hacker News</span>
          <span class="demo-nav">new · ask · show</span>
        </div>
        <div class="demo-stories">
          <div class="demo-story">Rust 2025 Edition release notes</div>
          <div class="demo-story">Ask HN: How do you handle burnout?</div>
          <div class="demo-story">The anatomy of a fast compiler</div>
        </div>
      </div>
    </section>

    <!-- ─── V4: Gradient veil ─────────────────────────────────────────────── -->
    <section class="memorial-variant">
      <h3>Variant 4 — Gradient veil</h3>
      <p class="memorial-variant__desc">
        An 18 px overlay gradient falls from the very top of the page —
        <code>rgba(0,0,0,0.65)</code> to transparent — casting a shadow over the header.
        Works on every theme because it darkens whatever sits beneath it.
        Barely noticed on first pass; faintly unsettling once registered.
      </p>
      <div class="demo-site demo-site--veil">
        <div class="demo-header">
          <span class="demo-logo">Y</span>
          <span class="demo-site-name">Hacker News</span>
          <span class="demo-nav">new · ask · show</span>
        </div>
        <div class="demo-stories">
          <div class="demo-story">Rust 2025 Edition release notes</div>
          <div class="demo-story">Ask HN: How do you handle burnout?</div>
          <div class="demo-story">The anatomy of a fast compiler</div>
        </div>
      </div>
    </section>

    <!-- ─── V5: Corner fold ───────────────────────────────────────────────── -->
    <section class="memorial-variant">
      <h3>Variant 5 — Corner fold</h3>
      <p class="memorial-variant__desc">
        A small dark triangle in the top-left corner — an abstraction of the mourning-ribbon fold
        used in print culture. Uses <code>var(--color-text)</code> so it contrasts on all themes.
        Easy to miss entirely; unmistakeable once noticed.
      </p>
      <div class="demo-site demo-site--corner">
        <div class="demo-header">
          <span class="demo-logo">Y</span>
          <span class="demo-site-name">Hacker News</span>
          <span class="demo-nav">new · ask · show</span>
        </div>
        <div class="demo-stories">
          <div class="demo-story">Rust 2025 Edition release notes</div>
          <div class="demo-story">Ask HN: How do you handle burnout?</div>
          <div class="demo-story">The anatomy of a fast compiler</div>
        </div>
      </div>
    </section>

    <!-- ─── V6: Full-page greyscale ───────────────────────────────────────── -->
    <section class="memorial-variant">
      <h3>Variant 6 — Full-page greyscale</h3>
      <p class="memorial-variant__desc">
        <code>filter: grayscale(1)</code> applied to the entire page. A recognised web mourning
        convention — major portals in Japan, South Korea and parts of Europe switch to monochrome
        on national days of mourning. Immediately striking; meaning understood broadly in digital
        culture. Note: affects colour-dependent UI affordances.
      </p>
      <div class="demo-site demo-site--greyscale">
        <div class="demo-header">
          <span class="demo-logo">Y</span>
          <span class="demo-site-name">Hacker News</span>
          <span class="demo-nav">new · ask · show</span>
        </div>
        <div class="demo-stories">
          <div class="demo-story">Rust 2025 Edition release notes</div>
          <div class="demo-story">Ask HN: How do you handle burnout?</div>
          <div class="demo-story">The anatomy of a fast compiler</div>
        </div>
      </div>
    </section>

    <!-- ─── V7: Inverted header ───────────────────────────────────────────── -->
    <section class="memorial-variant">
      <h3>Variant 7 — Inverted header</h3>
      <p class="memorial-variant__desc">
        <code>filter: invert(1)</code> on the header only. The brand colour flips to its
        complementary — orange becomes a bright cyan-blue; nord's teal becomes a warm red.
        Immediately wrong-looking; the cause is completely opaque. Works on every theme
        because the inversion adapts to whatever accent colour is active.
      </p>
      <div class="demo-site demo-site--invert-header">
        <div class="demo-header">
          <span class="demo-logo">Y</span>
          <span class="demo-site-name">Hacker News</span>
          <span class="demo-nav">new · ask · show</span>
        </div>
        <div class="demo-stories">
          <div class="demo-story">Rust 2025 Edition release notes</div>
          <div class="demo-story">Ask HN: How do you handle burnout?</div>
          <div class="demo-story">The anatomy of a fast compiler</div>
        </div>
      </div>
    </section>

    <!-- ─── V8: Dark logo ────────────────────────────────────────────────── -->
    <section class="memorial-variant">
      <h3>Variant 8 — Dark logo</h3>
      <p class="memorial-variant__desc">
        Only the Y emblem changes — its box dims to near-black via
        <code>filter: grayscale(1) brightness(0.2)</code>. The orange header stays intact.
        A single mourning pixel in an otherwise untouched UI. More pointed than the greyed
        accent because it targets the one glyph that carries identity.
      </p>
      <div class="demo-site demo-site--dark-logo">
        <div class="demo-header">
          <span class="demo-logo">Y</span>
          <span class="demo-site-name">Hacker News</span>
          <span class="demo-nav">new · ask · show</span>
        </div>
        <div class="demo-stories">
          <div class="demo-story">Rust 2025 Edition release notes</div>
          <div class="demo-story">Ask HN: How do you handle burnout?</div>
          <div class="demo-story">The anatomy of a fast compiler</div>
        </div>
      </div>
    </section>

    <!-- ─── V9: Content fog ──────────────────────────────────────────────── -->
    <section class="memorial-variant">
      <h3>Variant 9 — Content fog</h3>
      <p class="memorial-variant__desc">
        The story list drops to <code>opacity: 0.6</code> while the header stays fully vivid.
        The brand asserts itself; the content recedes. Reads as "today's news is secondary."
        More unsettling than a bar because the information is present but deliberately retreated.
      </p>
      <div class="demo-site demo-site--content-fog">
        <div class="demo-header">
          <span class="demo-logo">Y</span>
          <span class="demo-site-name">Hacker News</span>
          <span class="demo-nav">new · ask · show</span>
        </div>
        <div class="demo-stories">
          <div class="demo-story">Rust 2025 Edition release notes</div>
          <div class="demo-story">Ask HN: How do you handle burnout?</div>
          <div class="demo-story">The anatomy of a fast compiler</div>
        </div>
      </div>
    </section>

    <!-- ─── V10: Breathing dim ───────────────────────────────────────────── -->
    <section class="memorial-variant">
      <h3>Variant 10 — Breathing dim</h3>
      <p class="memorial-variant__desc">
        The entire page pulses very slowly between full and
        <code>opacity: 0.84</code> on a 4 s ease-in-out loop. Motion is the signal —
        the page is alive but not well. Completely opaque in meaning; slightly uncanny once
        you notice the rhythm. Should respect
        <code>prefers-reduced-motion</code> in any real implementation.
      </p>
      <div class="demo-site demo-site--breathe">
        <div class="demo-header">
          <span class="demo-logo">Y</span>
          <span class="demo-site-name">Hacker News</span>
          <span class="demo-nav">new · ask · show</span>
        </div>
        <div class="demo-stories">
          <div class="demo-story">Rust 2025 Edition release notes</div>
          <div class="demo-story">Ask HN: How do you handle burnout?</div>
          <div class="demo-story">The anatomy of a fast compiler</div>
        </div>
      </div>
    </section>

    <!-- ─── V11: Mourning frame ──────────────────────────────────────────── -->
    <section class="memorial-variant">
      <h3>Variant 11 — Mourning frame</h3>
      <p class="memorial-variant__desc">
        A 3 px inset frame drawn around the entire page using CSS
        <code>outline</code>. Traditional print newspapers ran a full-page black border on
        days of national mourning. The frame uses <code>var(--color-text)</code> — no colour
        change, no filter — just a border where one isn't normally expected.
      </p>
      <div class="demo-site demo-site--mournframe">
        <div class="demo-header">
          <span class="demo-logo">Y</span>
          <span class="demo-site-name">Hacker News</span>
          <span class="demo-nav">new · ask · show</span>
        </div>
        <div class="demo-stories">
          <div class="demo-story">Rust 2025 Edition release notes</div>
          <div class="demo-story">Ask HN: How do you handle burnout?</div>
          <div class="demo-story">The anatomy of a fast compiler</div>
        </div>
      </div>
    </section>

    <!-- ─── V12: Woven texture ───────────────────────────────────────────── -->
    <section class="memorial-variant">
      <h3>Variant 12 — Woven texture</h3>
      <p class="memorial-variant__desc">
        A very faint 45° hairline grid is laid over the page using a
        <code>repeating-linear-gradient</code> at ~5 % opacity. The pattern evokes crepe or
        mourning fabric. Uses <code>currentColor</code> so it is dark on light themes and
        light on dark themes — you perceive it as texture rather than colour.
      </p>
      <div class="demo-site demo-site--texture">
        <div class="demo-header">
          <span class="demo-logo">Y</span>
          <span class="demo-site-name">Hacker News</span>
          <span class="demo-nav">new · ask · show</span>
        </div>
        <div class="demo-stories">
          <div class="demo-story">Rust 2025 Edition release notes</div>
          <div class="demo-story">Ask HN: How do you handle burnout?</div>
          <div class="demo-story">The anatomy of a fast compiler</div>
        </div>
      </div>
    </section>

    <!-- ─── V13: Vignette ────────────────────────────────────────────────── -->
    <section class="memorial-variant">
      <h3>Variant 13 — Vignette</h3>
      <p class="memorial-variant__desc">
        A radial gradient overlay: transparent at the centre, darkening toward every edge.
        A photography trope for melancholy and decay. Theme-agnostic — the darkening works
        on every background. Feels like looking at the page through a shroud.
      </p>
      <div class="demo-site demo-site--vignette">
        <div class="demo-header">
          <span class="demo-logo">Y</span>
          <span class="demo-site-name">Hacker News</span>
          <span class="demo-nav">new · ask · show</span>
        </div>
        <div class="demo-stories">
          <div class="demo-story">Rust 2025 Edition release notes</div>
          <div class="demo-story">Ask HN: How do you handle burnout?</div>
          <div class="demo-story">The anatomy of a fast compiler</div>
        </div>
      </div>
    </section>

    <!-- ─── V14: Type memorial ───────────────────────────────────────────── -->
    <section class="memorial-variant">
      <h3>Variant 14 — Type memorial</h3>
      <p class="memorial-variant__desc">
        Story titles drop to <code>font-weight: 400</code> and gain a touch of
        <code>letter-spacing</code>. No colour, no bar. The text becomes quieter —
        a register shift from headlines to inscription. The change is subtle enough that
        you may feel something is off before you identify what.
      </p>
      <div class="demo-site demo-site--type-memorial">
        <div class="demo-header">
          <span class="demo-logo">Y</span>
          <span class="demo-site-name">Hacker News</span>
          <span class="demo-nav">new · ask · show</span>
        </div>
        <div class="demo-stories">
          <div class="demo-story">Rust 2025 Edition release notes</div>
          <div class="demo-story">Ask HN: How do you handle burnout?</div>
          <div class="demo-story">The anatomy of a fast compiler</div>
        </div>
      </div>
    </section>

    <!-- ─── V15: Dissolved header ────────────────────────────────────────── -->
    <section class="memorial-variant">
      <h3>Variant 15 — Dissolved header</h3>
      <p class="memorial-variant__desc">
        The header gives up its brand colour and takes on the neutral surface tone.
        The Y emblem is recoloured to a solid accent box — now the only concentrated
        colour on the page. The identity hasn't vanished; it has retreated. Reading:
        "we are still here, but today is not about us."
      </p>
      <div class="demo-site demo-site--dissolved">
        <div class="demo-header">
          <span class="demo-logo">Y</span>
          <span class="demo-site-name">Hacker News</span>
          <span class="demo-nav">new · ask · show</span>
        </div>
        <div class="demo-stories">
          <div class="demo-story">Rust 2025 Edition release notes</div>
          <div class="demo-story">Ask HN: How do you handle burnout?</div>
          <div class="demo-story">The anatomy of a fast compiler</div>
        </div>
      </div>
    </section>

    <!-- ─── V16: Crepe weave ─────────────────────────────────────────────── -->
    <section class="memorial-variant">
      <h3>Variant 16 — Crepe weave</h3>
      <p class="memorial-variant__desc">
        A header-only texture made from uneven diagonal threads at two weights. Less like a clean
        hatch, more like crepe mourning fabric. Still theme-aware through <code>currentColor</code>,
        but rougher and more funeral-coded than a single stripe system.
      </p>
      <div class="demo-site demo-site--crepe">
        <div class="demo-header">
          <span class="demo-logo">Y</span>
          <span class="demo-site-name">Hacker News</span>
          <span class="demo-nav">new · ask · show</span>
        </div>
        <div class="demo-stories">
          <div class="demo-story">Rust 2025 Edition release notes</div>
          <div class="demo-story">Ask HN: How do you handle burnout?</div>
          <div class="demo-story">The anatomy of a fast compiler</div>
        </div>
      </div>
    </section>

    <!-- ─── V17: Veil mesh ──────────────────────────────────────────────── -->
    <section class="memorial-variant">
      <h3>Variant 17 — Veil mesh</h3>
      <p class="memorial-variant__desc">
        A fine mesh laid only over the header, using crossed hairlines at very low opacity. The
        result feels more like a mourning veil or gauze than a pattern. Quiet, soft, and
        ceremonial without reading as warning stripes.
      </p>
      <div class="demo-site demo-site--veil-mesh">
        <div class="demo-header">
          <span class="demo-logo">Y</span>
          <span class="demo-site-name">Hacker News</span>
          <span class="demo-nav">new · ask · show</span>
        </div>
        <div class="demo-stories">
          <div class="demo-story">Rust 2025 Edition release notes</div>
          <div class="demo-story">Ask HN: How do you handle burnout?</div>
          <div class="demo-story">The anatomy of a fast compiler</div>
        </div>
      </div>
    </section>

    <!-- ─── V18: Corner ribbon ──────────────────────────────────────────── -->
    <section class="memorial-variant">
      <h3>Variant 18 — Corner ribbon</h3>
      <p class="memorial-variant__desc">
        A small folded black ribbon sits in the header corner while the rest of the UI stays
        intact. Stronger memorial symbolism than texture alone, but still compact and easy to
        ignore if you are not looking for it.
      </p>
      <div class="demo-site demo-site--corner-ribbon">
        <div class="demo-header">
          <span class="demo-logo">Y</span>
          <span class="demo-site-name">Hacker News</span>
          <span class="demo-nav">new · ask · show</span>
        </div>
        <div class="demo-stories">
          <div class="demo-story">Rust 2025 Edition release notes</div>
          <div class="demo-story">Ask HN: How do you handle burnout?</div>
          <div class="demo-story">The anatomy of a fast compiler</div>
        </div>
      </div>
    </section>

  </section>
</template>

<style scoped lang="scss">

// ─── Section layout ─────────────────────────────────────────────────────────

.memorial-concepts {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.memorial-variant h3 {
  margin: 0 0 0.5rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-family: var(--font-title);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.memorial-variant__desc {
  margin: 0 0 0.9rem;
  max-width: 58ch;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  line-height: 1.6;
}

.memorial-variant__desc code {
  padding: 0.06em 0.32em;
  background: var(--color-code-bg);
  border-radius: 3px;
  font-family: var(--font-mono);
  font-size: 0.83em;
  color: var(--color-text);
}

// ─── Demo site chrome ────────────────────────────────────────────────────────

.demo-site {
  position: relative;
  max-width: 40rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: var(--shadow-elevation);
}

.demo-header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.45rem 0.65rem;
  background: var(--color-accent);
  color: var(--color-accent-contrast);
  font-size: 0.8rem;
  font-weight: 600;
}

.demo-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.3rem;
  height: 1.3rem;
  background: rgba(255, 255, 255, 0.88);
  color: var(--color-accent);
  font-family: var(--font-title);
  font-size: 0.7rem;
  font-weight: 900;
  border-radius: 1px;
}

.demo-site-name {
  font-family: var(--font-title);
  font-weight: 700;
}

.demo-nav {
  margin-left: auto;
  opacity: 0.75;
  font-weight: 500;
}

.demo-stories {
  background: var(--color-surface);
}

.demo-story {
  padding: 0.55rem 0.7rem;
  font-size: 0.875rem;
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }
}

// ─── V1: Hairline ────────────────────────────────────────────────────────────

.demo-site--hairline::before {
  content: '';
  display: block;
  height: 4px;
  background: var(--color-text);
}

// ─── V2: Greyed accent ───────────────────────────────────────────────────────

.demo-site--grey-header .demo-header {
  filter: grayscale(1);
}

// ─── V3: Muted wide rule ─────────────────────────────────────────────────────

.demo-site--muted-rule .demo-header {
  border-top: 7px solid var(--color-text-muted);
}

// ─── V4: Gradient veil ───────────────────────────────────────────────────────

// ::after overlays the header from the top edge down
.demo-site--veil::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 18px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.65), transparent);
  pointer-events: none;
  z-index: 1;
}

// ─── V5: Corner fold ─────────────────────────────────────────────────────────

// Square off the top-left so the triangle sits flush with the corner
.demo-site--corner {
  border-top-left-radius: 0;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    width: 0;
    height: 0;
    border-style: solid;
    // 26px triangle — visible but not dominating
    border-width: 26px 26px 0 0;
    border-color: var(--color-text) transparent transparent transparent;
  }
}

// ─── V6: Full-page greyscale ─────────────────────────────────────────────────

.demo-site--greyscale {
  filter: grayscale(1);
}
// ─── V7: Inverted header ─────────────────────────────────────────────────

.demo-site--invert-header .demo-header {
  filter: invert(1);
}

// ─── V8: Dark logo ───────────────────────────────────────────────────────

.demo-site--dark-logo .demo-logo {
  filter: grayscale(1) brightness(0.2);
}

// ─── V9: Content fog ─────────────────────────────────────────────────────

.demo-site--content-fog .demo-stories {
  opacity: 0.6;
}

// ─── V10: Breathing dim ──────────────────────────────────────────────────

@keyframes memorial-breathe {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.84; }
}

.demo-site--breathe {
  animation: memorial-breathe 4s ease-in-out infinite;
}

// ─── V11: Mourning frame ─────────────────────────────────────────────────

// outline paints above all children — no pseudo-element needed
.demo-site--mournframe {
  outline: 3px solid var(--color-text);
  outline-offset: -3px;
}

// ─── V12: Woven texture ──────────────────────────────────────────────────

// currentColor inherits var(--color-text) through the stacking context
.demo-site--texture::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    45deg,
    currentColor 0,
    currentColor 1px,
    transparent 1px,
    transparent 10px
  );
  opacity: 0.055;
  pointer-events: none;
  z-index: 1;
}

// ─── V13: Vignette ───────────────────────────────────────────────────────

.demo-site--vignette::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.55) 100%);
  pointer-events: none;
  z-index: 2;
}

// ─── V14: Type memorial ──────────────────────────────────────────────────

.demo-site--type-memorial .demo-story {
  font-weight: 400;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

// ─── V15: Dissolved header ───────────────────────────────────────────────

.demo-site--dissolved .demo-header {
  background: var(--color-surface);
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
}

// Logo becomes the only accent element — solid inversion of normal box
.demo-site--dissolved .demo-logo {
  background: var(--color-accent);
  color: var(--color-accent-contrast);
}

// ─── V16: Crepe weave ────────────────────────────────────────────────────

.demo-site--crepe .demo-header::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    repeating-linear-gradient(
      45deg,
      currentColor 0,
      currentColor 1px,
      transparent 1px,
      transparent 7px
    ),
    repeating-linear-gradient(
      45deg,
      transparent 0,
      transparent 5px,
      currentColor 5px,
      currentColor 6px,
      transparent 6px,
      transparent 15px
    );
  opacity: 0.09;
  pointer-events: none;
}

// ─── V17: Veil mesh ─────────────────────────────────────────────────────

.demo-site--veil-mesh .demo-header::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    repeating-linear-gradient(
      45deg,
      currentColor 0,
      currentColor 1px,
      transparent 1px,
      transparent 11px
    ),
    repeating-linear-gradient(
      135deg,
      currentColor 0,
      currentColor 1px,
      transparent 1px,
      transparent 11px
    );
  opacity: 0.05;
  pointer-events: none;
}

// ─── V18: Corner ribbon ─────────────────────────────────────────────────

.demo-site--corner-ribbon .demo-header::before,
.demo-site--corner-ribbon .demo-header::after {
  content: '';
  position: absolute;
  top: 0.2rem;
  right: 0.45rem;
  width: 0.52rem;
  height: 1rem;
  background: #111;
  border-radius: 999px 999px 0 0;
  transform-origin: top center;
}

.demo-site--corner-ribbon .demo-header::before {
  transform: rotate(24deg);
}

.demo-site--corner-ribbon .demo-header::after {
  transform: rotate(-24deg);
}

</style>
