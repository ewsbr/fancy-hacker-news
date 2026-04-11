<script setup lang="ts">
import ConceptVariant from './ConceptVariant.vue';
</script>

<template>
  <section class="concept-app__section-head">
    <div>
      <p class="concept-app__section-eyebrow">404 page</p>
      <h2 class="concept-app__section-title">Four directions for the "Unknown." 404 response</h2>
    </div>
    <p class="concept-app__section-copy">
      HN's 404 is a bare <code>&lt;pre&gt;Unknown.&lt;/pre&gt;</code>. Each concept below turns that into
      a designed moment that still feels like Hacker News.
    </p>
  </section>

  <div class="nf-concepts">

    <!-- ─── Concept A: Typographic "Unknown." ─────────────────────────────── -->
    <ConceptVariant class="nf-variant" eyebrow="Variant 1" title="Typographic — Own the silence">
      <template #description>
        <p>
          Leans into HN's terse native response and turns it into an intentional design
          moment. "Unknown." is displayed huge, as a direct quote, with a minimal CTA.
        </p>
      </template>

      <div class="nf-shell nf-shell--a">
        <!-- accent top bar simulating .hn-content-card -->
        <div class="nf-card nf-card--a">
          <span class="nf-card-a__code">404</span>
          <blockquote class="nf-card-a__quote">Unknown.</blockquote>
          <p class="nf-card-a__sub">
            The page at this address does not exist,<br>
            or was removed, or never existed at all.
          </p>
          <div class="nf-card-a__actions">
            <a href="#" class="nf-btn nf-btn--primary">← Back to Hacker News</a>
            <a href="#" class="nf-btn nf-btn--ghost">Search</a>
          </div>
        </div>
      </div>
    </ConceptVariant>

    <!-- ─── Concept B: Dead Story Card ────────────────────────────────────── -->
    <ConceptVariant class="nf-variant" eyebrow="Variant 2" title="Dead Story — the page got flagged">
      <template #description>
        <p>
          Renders the 404 as a dead/flagged story. Familiar HN story-row
          language: rank, vote, title, meta — but everything is muted and the
          <code>[dead]</code> badge seals the message.
        </p>
      </template>

      <div class="nf-shell nf-shell--b">
        <div class="nf-card nf-card--b">
          <!-- eyebrow -->
          <p class="nf-dead-eyebrow">Page not found</p>

          <!-- mock story row -->
          <div class="nf-dead-story">
            <span class="nf-dead-story__rank">404.</span>
            <div class="nf-dead-story__vote">
              <svg width="10" height="9" viewBox="0 0 10 9" fill="none" aria-hidden="true">
                <path d="M5 1L9 8H1L5 1Z" fill="currentColor"/>
              </svg>
            </div>
            <div class="nf-dead-story__body">
              <p class="nf-dead-story__title">
                The page you are looking for
                <span class="nf-badge nf-badge--dead">[dead]</span>
              </p>
              <p class="nf-dead-story__meta">
                <span class="nf-dead-story__score">0 points</span>
                <span class="nf-sep"> · </span>
                <span>by <a href="#">nobody</a></span>
                <span class="nf-sep"> · </span>
                <span>just now</span>
                <span class="nf-sep"> · </span>
                <a href="#">404 comments</a>
              </p>
            </div>
          </div>

          <!-- comment snippet -->
          <div class="nf-dead-comment">
            <div class="nf-dead-comment__indent"></div>
            <div class="nf-dead-comment__body">
              <p class="nf-dead-comment__meta">
                <a href="#" class="nf-dead-comment__author">dang</a>
                <span class="nf-sep"> · </span>
                <span>1 minute ago</span>
                <span class="nf-badge nf-badge--mod">mod</span>
              </p>
              <p class="nf-dead-comment__text">
                This URL doesn't correspond to anything on our servers.
                If you followed a link that should work, feel free to email <a href="#">hn@ycombinator.com</a>.
              </p>
            </div>
          </div>

          <div class="nf-dead-cta">
            <a href="#" class="nf-btn nf-btn--primary">← Front page</a>
            <a href="#" class="nf-btn nf-btn--ghost">Search HN</a>
          </div>
        </div>
      </div>
    </ConceptVariant>

    <!-- ─── Concept C: Terminal ───────────────────────────────────────────── -->
    <ConceptVariant class="nf-variant" eyebrow="Variant 3" title="Terminal — raw signal, no noise">
      <template #description>
        <p>
          A monospace terminal output block. Fits audiences that live in a shell.
          Color-coded like a real HTTP response: muted request, red status, orange hints.
        </p>
      </template>

      <div class="nf-shell nf-shell--c">
        <div class="nf-card nf-card--c">
          <div class="nf-term">
            <div class="nf-term__bar">
              <span class="nf-term__dot nf-term__dot--red"></span>
              <span class="nf-term__dot nf-term__dot--yellow"></span>
              <span class="nf-term__dot nf-term__dot--green"></span>
              <span class="nf-term__bar-title">bash</span>
            </div>
            <div class="nf-term__body">
              <p class="nf-term__line">
                <span class="nf-term__prompt">$ </span>
                <span class="nf-term__cmd">curl -I https://news.ycombinator.com/unknown</span>
              </p>
              <p class="nf-term__line nf-term__line--muted">
                &gt; GET /unknown HTTP/2
              </p>
              <p class="nf-term__line nf-term__line--muted">
                &gt; Host: news.ycombinator.com
              </p>
              <p class="nf-term__line nf-term__spacer">&nbsp;</p>
              <p class="nf-term__line">
                <span class="nf-term__status-code">HTTP/2 200</span>
                <span class="nf-term__line--muted">  ← wait, HN returns 200 for everything</span>
              </p>
              <p class="nf-term__line nf-term__line--muted">Content-Type: text/html; charset=utf-8</p>
              <p class="nf-term__line nf-term__spacer">&nbsp;</p>
              <p class="nf-term__line">
                <span class="nf-term__prompt">$ </span>
                <span class="nf-term__cmd">curl https://news.ycombinator.com/unknown | grep -o '&lt;pre&gt;.*&lt;/pre&gt;'</span>
              </p>
              <p class="nf-term__line nf-term__line--accent">&lt;pre&gt;Unknown.&lt;/pre&gt;</p>
              <p class="nf-term__spacer">&nbsp;</p>
              <p class="nf-term__line nf-term__line--error">error: the page you requested could not be found</p>
              <p class="nf-term__line nf-term__line--hint">hint: try <span class="nf-term__inline-cmd">curl https://news.ycombinator.com/</span> instead</p>
              <p class="nf-term__line nf-term__spacer">&nbsp;</p>
              <p class="nf-term__line">
                <span class="nf-term__prompt">$ </span>
                <span class="nf-term__cursor">█</span>
              </p>
            </div>
          </div>
          <div class="nf-term-cta">
            <a href="#" class="nf-btn nf-btn--primary">← Front page</a>
            <a href="#" class="nf-btn nf-btn--ghost">Search HN</a>
          </div>
        </div>
      </div>
    </ConceptVariant>

    <!-- ─── Concept D: Ask HN parody ─────────────────────────────────────── -->
    <ConceptVariant class="nf-variant" eyebrow="Variant 4" title="Ask HN — the community weighs in">
      <template #description>
        <p>
          Frames the 404 as an Ask HN thread, complete with a mock comment
          from <em>dang</em> as the official moderator response. Playful —
          feels completely at home on HN.
        </p>
      </template>

      <div class="nf-shell nf-shell--d">
        <!-- Story header -->
        <div class="nf-ask-header">
          <div class="nf-ask-header__inner">
            <p class="nf-ask-header__title">
              Ask HN: Where did this page go?
            </p>
            <p class="nf-ask-header__meta">
              <span>1 point</span>
              <span class="nf-sep"> · </span>
              <span>by <a href="#">you</a></span>
              <span class="nf-sep"> · </span>
              <span>just now</span>
              <span class="nf-sep"> · </span>
              <a href="#">1 comment</a>
            </p>
            <p class="nf-ask-header__body">
              The URL I followed doesn't seem to exist. Checked twice.
              Getting "Unknown." Has this ever happened to anyone else?
              Is this a known issue?
            </p>
          </div>
        </div>

        <!-- Comment tree -->
        <div class="nf-ask-comments">

          <!-- dang's reply -->
          <div class="nf-ask-comment nf-ask-comment--top">
            <div class="nf-ask-comment__vote">▲</div>
            <div class="nf-ask-comment__body">
              <p class="nf-ask-comment__meta">
                <a href="#" class="nf-ask-comment__author nf-ask-comment__author--mod">dang</a>
                <span class="nf-badge nf-badge--mod">mod</span>
                <span class="nf-sep"> · </span>
                <span class="nf-ask-comment__age">1 minute ago</span>
                <span class="nf-sep"> · </span>
                <a href="#" class="nf-ask-comment__action">reply</a>
              </p>
              <p class="nf-ask-comment__text">
                This happens because the URL you visited doesn't correspond to anything on our servers.
                It's by design — HN responds with literal "Unknown." for all 404s (and returns HTTP 200,
                for reasons lost to history).
              </p>
              <p class="nf-ask-comment__text nf-ask-comment__text--mt">
                Head back to <a href="#">Hacker News</a> or use the search below.
              </p>
            </div>
          </div>

          <!-- nested reply -->
          <div class="nf-ask-comment nf-ask-comment--nested">
            <div class="nf-ask-comment__vote">▲</div>
            <div class="nf-ask-comment__body">
              <p class="nf-ask-comment__meta">
                <a href="#" class="nf-ask-comment__author">tptacek</a>
                <span class="nf-sep"> · </span>
                <span class="nf-ask-comment__age">just now</span>
                <span class="nf-sep"> · </span>
                <a href="#" class="nf-ask-comment__action">reply</a>
              </p>
              <p class="nf-ask-comment__text">
                The HTTP 200 thing is actually a useful security quirk — it prevents
                enumeration of valid paths. Very pg.
              </p>
            </div>
          </div>

          <!-- CTA bar -->
          <div class="nf-ask-cta">
            <a href="#" class="nf-btn nf-btn--primary">← Front page</a>
            <a href="#" class="nf-btn nf-btn--ghost">Search HN</a>
          </div>
        </div>
      </div>
    </ConceptVariant>

  </div>
</template>

<style scoped lang="scss">
// ─── Layout ──────────────────────────────────────────────────────────────────

.nf-concepts {
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
}

// ─── Variant wrapper ─────────────────────────────────────────────────────────

// ─── Shared shell + card ──────────────────────────────────────────────────────

.nf-shell {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 2rem;

  @media (max-width: 640px) {
    padding: 1rem;
  }
}

.nf-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-top: 3px solid var(--color-accent);
  border-radius: 4px;
  box-shadow: var(--shadow-elevation);
  overflow: hidden;
}

// ─── Shared buttons ───────────────────────────────────────────────────────────

.nf-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.65rem 1.1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-family: var(--font-title);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 100ms, border-color 100ms, color 100ms;

  &--primary {
    background: var(--color-accent);
    border-color: var(--color-accent);
    color: #fff;

    &:hover {
      background: var(--color-accent-strong);
      border-color: var(--color-accent-strong);
      text-decoration: none;
    }
  }

  &--ghost {
    background: transparent;
    color: var(--color-text-muted);

    &:hover {
      border-color: var(--color-text-muted);
      color: var(--color-text);
      text-decoration: none;
    }
  }
}

// ─── Shared badges ────────────────────────────────────────────────────────────

.nf-badge {
  display: inline-block;
  padding: 0.1em 0.45em;
  border-radius: 3px;
  font-family: var(--font-title);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  vertical-align: middle;

  &--dead {
    background: var(--color-status-muted-bg);
    border: 1px solid var(--color-status-muted-border);
    color: var(--color-text-muted);
  }

  &--mod {
    background: var(--color-accent-badge-bg);
    border: 1px solid var(--color-accent-badge-border);
    color: var(--color-accent);
    margin-left: 0.3em;
  }
}

// ─── Meta separator ───────────────────────────────────────────────────────────

.nf-sep {
  color: var(--color-text-muted);
  margin: 0 0.1em;
}

// ─────────────────────────────────────────────────────────────────────────────
// Concept A — typographic
// ─────────────────────────────────────────────────────────────────────────────

.nf-card--a {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 3rem 3rem 2.5rem;

  @media (max-width: 640px) {
    padding: 2rem 1.25rem 1.75rem;
  }
}

.nf-card-a__code {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--color-accent);
  text-transform: uppercase;
}

.nf-card-a__quote {
  margin: 0;
  font-family: var(--font-title);
  font-size: clamp(3.5rem, 9vw, 7rem);
  font-weight: 800;
  line-height: 0.95;
  color: var(--color-text);

  // subtle left bar to reinforce blockquote semantic
  padding-left: 0.35em;
  border-left: 4px solid var(--color-accent);
}

.nf-card-a__sub {
  margin: 0;
  max-width: 28rem;
  color: var(--color-text-muted);
  font-size: 0.925rem;
  line-height: 1.65;
}

.nf-card-a__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.25rem;
}

// ─────────────────────────────────────────────────────────────────────────────
// Concept B — dead story card
// ─────────────────────────────────────────────────────────────────────────────

.nf-card--b {
  padding: 1.25rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.nf-dead-eyebrow {
  margin: 0;
  font-family: var(--font-title);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.nf-dead-story {
  display: flex;
  align-items: baseline;
  gap: 0.55rem;
}

.nf-dead-story__rank {
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-muted);
  min-width: 2.5rem;
  text-align: right;
  flex-shrink: 0;
}

.nf-dead-story__vote {
  color: var(--color-text-muted);
  opacity: 0.35;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.nf-dead-story__body {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.nf-dead-story__title {
  margin: 0;
  font-family: var(--font-title);
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-muted);
  line-height: 1.3;
}

.nf-dead-story__meta {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-text-muted);

  a {
    color: var(--color-text-muted);
    &:hover { color: var(--color-accent); }
  }
}

.nf-dead-story__score {
  color: var(--color-text-muted);
}

.nf-dead-comment {
  display: flex;
  gap: 0;
  padding-left: 1rem;
  border-left: 2px solid var(--color-border);
  margin-left: 3.5rem;
}

.nf-dead-comment__indent {
  width: 0.5rem;
  flex-shrink: 0;
}

.nf-dead-comment__body {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.nf-dead-comment__meta {
  margin: 0;
  font-size: 0.78rem;
  color: var(--color-text-muted);

  a {
    color: var(--color-text-muted);
    &:hover { color: var(--color-accent); }
  }
}

.nf-dead-comment__author {
  font-weight: 700;
  color: var(--color-text-muted);
}

.nf-dead-comment__text {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.6;

  a {
    color: var(--color-accent);
    &:hover { text-decoration: underline; }
  }
}

.nf-dead-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  padding-top: 0.25rem;
}

// ─────────────────────────────────────────────────────────────────────────────
// Concept C — terminal
// ─────────────────────────────────────────────────────────────────────────────

.nf-shell--c {
  background: #0d0d0d;
  border-color: #2a2a2a;
  padding: 0;
  overflow: hidden;
}

.nf-card--c {
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
  display: flex;
  flex-direction: column;
}

.nf-term {
  background: #111;
  font-family: var(--font-mono);
  font-size: 0.83rem;
  line-height: 1.6;
}

.nf-term__bar {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 0.9rem;
  background: #1e1e1e;
  border-bottom: 1px solid #2a2a2a;
}

.nf-term__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;

  &--red    { background: #ff5f57; }
  &--yellow { background: #ffbd2e; }
  &--green  { background: #27c93f; }
}

.nf-term__bar-title {
  flex: 1;
  text-align: center;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: #666;
}

.nf-term__body {
  padding: 1rem 1.25rem 1.25rem;
}

.nf-term__line {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  color: #c8c8c8;

  &--muted  { color: #555; }
  &--accent { color: #ff6600; }
  &--error  { color: #ff5f57; }
  &--hint   { color: #a8a8a8; }
}

.nf-term__spacer {
  line-height: 0.6;
}

.nf-term__prompt {
  color: #27c93f;
  user-select: none;
}

.nf-term__cmd {
  color: #ddd;
}

.nf-term__status-code {
  color: #ffbd2e;
  font-weight: 600;
}

.nf-term__inline-cmd {
  color: #88c0d0;
}

.nf-term__cursor {
  display: inline-block;
  width: 0.55em;
  background: #c8c8c8;
  color: transparent;
  animation: nf-blink 1.1s step-end infinite;
}

@keyframes nf-blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

.nf-term-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  padding: 1.25rem 1.5rem;
  background: #161616;
  border-top: 1px solid #2a2a2a;
}

// ─────────────────────────────────────────────────────────────────────────────
// Concept D — Ask HN parody
// ─────────────────────────────────────────────────────────────────────────────

.nf-ask-header {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-top: 3px solid var(--color-accent);
  border-bottom: none;
  border-radius: 4px 4px 0 0;
  box-shadow: var(--shadow-elevation);
}

.nf-ask-header__inner {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.nf-ask-header__title {
  margin: 0;
  font-family: var(--font-title);
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.2;
}

.nf-ask-header__meta {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-text-muted);

  a {
    color: var(--color-text-muted);
    &:hover { color: var(--color-accent); }
  }
}

.nf-ask-header__body {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  line-height: 1.65;
  color: var(--color-text);
  max-width: 52rem;
}

.nf-ask-comments {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-top: none;
  border-radius: 0 0 4px 4px;
  box-shadow: var(--shadow-elevation);
  padding: 0.5rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.nf-ask-comment {
  display: flex;
  gap: 0.55rem;
  padding: 0.85rem 0;
  border-top: 1px solid var(--color-divider);

  &--nested {
    padding-left: 1.75rem;
  }
}

.nf-ask-comment__vote {
  flex-shrink: 0;
  font-size: 0.8rem;
  color: var(--color-accent);
  padding-top: 0.05rem;
  user-select: none;
  cursor: pointer;
}

.nf-ask-comment__body {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
  min-width: 0;
}

.nf-ask-comment__meta {
  margin: 0;
  font-size: 0.78rem;
  color: var(--color-text-muted);

  a {
    color: var(--color-text-muted);
    &:hover { color: var(--color-accent); }
  }
}

.nf-ask-comment__author {
  font-weight: 700;

  &--mod {
    color: var(--color-accent) !important;
  }
}

.nf-ask-comment__age {
  font-size: 0.78rem;
}

.nf-ask-comment__action {
  font-size: 0.78rem;
}

.nf-ask-comment__text {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.65;
  color: var(--color-text);

  a {
    color: var(--color-accent);
    &:hover { text-decoration: underline; }
  }

  &--mt {
    margin-top: 0.3rem;
  }
}

.nf-ask-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-divider);
  margin-top: 0.5rem;
}
</style>
