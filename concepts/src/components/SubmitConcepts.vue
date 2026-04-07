<template>
  <section class="concept-app__section-head">
    <div>
      <p class="concept-app__section-eyebrow">submit page</p>
      <h2 class="concept-app__section-title">Nine directions based on the current shipped submit page</h2>
    </div>
    <p class="concept-app__section-copy">
      These stay anchored to the current design language: accent-top surfaces, title-heavy type, muted utility links, and an HN-style story preview.
    </p>
  </section>

  <section class="submit-concepts-list">
    <article class="submit-variant">
      <header class="submit-variant__header">
        <p class="submit-variant__eyebrow">Variant 1</p>
        <h3 class="submit-variant__title">Current Direction, Sharpened</h3>
        <p class="submit-variant__desc">A direct evolution of the shipped page: stronger intro, clearer preview, same overall card language.</p>
      </header>

      <div class="submit-variant__meta">
        <div>
          <strong>Closest to current implementation</strong>
          <span>Refinement rather than structural change</span>
        </div>
        <span class="submit-variant__tag">submit</span>
      </div>

      <div class="mock-shell">
        <div class="pill-row">
          <span class="pill pill--accent">submit</span>
          <span class="pill">bookmarklet ready</span>
        </div>

        <div class="mock-title-block">
          <h4>Submit a link or start a discussion</h4>
          <p>Use the URL field for link posts, leave it blank for discussion posts, and add text only when context helps the thread.</p>
        </div>

        <div class="utility-links">
          <a href="#">bookmarklet</a>
          <span>/</span>
          <a href="#">guidelines</a>
          <span>/</span>
          <a href="#">title style tips</a>
        </div>

        <div class="notice-card">
          <strong>HN reminder</strong>
          <p>Link posts do better when the title stays faithful to the source and the text box adds context instead of commentary.</p>
        </div>

        <div class="story-preview-card">
          <span class="story-preview-card__meta">1 point by you just now | 0 comments</span>
          <h4>YC founders pivot after learning users prefer products that work</h4>
          <p>The preview stays up top, similar to the current design, but gets slightly more breathing room and clearer separation from the form body.</p>
          <div class="story-preview-card__footer">
            <span>medium.com</span>
            <span>story preview</span>
          </div>
        </div>

        <div class="form-card">
          <div class="field-block">
            <div class="field-block__head">
              <label>Title</label>
              <span>Specific and source-faithful</span>
            </div>
            <input value="YC founders pivot after learning users prefer products that work" />
          </div>

          <div class="field-block">
            <div class="field-block__head">
              <label>URL</label>
              <span>Optional for Ask HN</span>
            </div>
            <input value="https://medium.com/@reliablemoat/users-prefer-products-that-work-9f41c5e2b7da" />
          </div>

          <div class="field-block">
            <div class="field-block__head">
              <label>Text</label>
              <span>Add context, not a rewrite</span>
            </div>
            <textarea>We cut the ornament around the form but kept the current hierarchy: intro, preview, then fields. This mostly aims to make the existing idea feel more intentional.</textarea>
          </div>

          <div class="form-card__footer">
            <p>Link posts can include optional context. Discussion posts should usually use title plus text.</p>
            <button class="action-button action-button--primary" type="button">submit post</button>
          </div>
        </div>
      </div>

      <p class="submit-variant__note">Best when the goal is refinement, not a structural rethink.</p>
    </article>

    <article class="submit-variant">
      <header class="submit-variant__header">
        <p class="submit-variant__eyebrow">Variant 2</p>
        <h3 class="submit-variant__title">Editorial Split Layout</h3>
        <p class="submit-variant__desc">Moves support copy and posting heuristics into a durable side rail so the form itself stays short and fast to scan.</p>
      </header>

      <div class="submit-variant__meta">
        <div>
          <strong>More guidance without tooltips</strong>
          <span>The side rail becomes the explanation layer</span>
        </div>
        <span class="submit-variant__tag">editorial rail</span>
      </div>

      <div class="mock-shell split-layout">
        <div class="form-card">
          <div class="panel-heading">
            <div>
              <h4>Post something worth opening</h4>
              <p>Guidance is pulled out of tooltips and into the page rhythm so the fields can stay simple.</p>
            </div>
            <span class="pill">link or ask</span>
          </div>

          <div class="field-block">
            <div class="field-block__head">
              <label>Title</label>
              <span>Think front-page headline, not ad copy</span>
            </div>
            <input value="Ask HN: Is there a polite way to say 'your startup could be a cron job'?" />
          </div>

          <div class="field-block">
            <div class="field-block__head">
              <label>URL</label>
              <span>Leave blank for discussion</span>
            </div>
            <input placeholder="https://example.com/post" />
          </div>

          <div class="field-block">
            <div class="field-block__head">
              <label>Text</label>
              <span>Required here because this is an Ask HN</span>
            </div>
            <textarea>A founder friend keeps describing an AI-native orchestration layer that sounds increasingly like one scheduled task and a Stripe webhook. Looking for phrasing that preserves the friendship.</textarea>
          </div>

          <div class="form-card__footer form-card__footer--tight">
            <button class="action-button action-button--ghost" type="button">save draft</button>
            <button class="action-button action-button--primary" type="button">submit discussion</button>
          </div>
        </div>

        <div class="sidebar-stack">
          <div class="aside-card">
            <span class="aside-card__label">why this works</span>
            <h4>The right rail becomes the tooltip system</h4>
            <p>This reduces icon clutter and lets support copy breathe without hiding it behind hover-only affordances.</p>
          </div>

          <div class="aside-card">
            <span class="aside-card__label">quick checks</span>
            <ul class="checklist">
              <li>Title is faithful to the linked page</li>
              <li>Text adds context instead of marketing</li>
              <li>Ask HN posts still read clearly with no URL</li>
            </ul>
          </div>

          <div class="story-preview-card">
            <span class="story-preview-card__meta">live preview</span>
            <h4>Ask HN: Is there a polite way to say 'your startup could be a cron job'?</h4>
            <p>A quieter preview card works here because the sidebar already carries the explanatory load.</p>
          </div>
        </div>
      </div>

      <p class="submit-variant__note">Good fit if you want to remove tooltip dependence across the page.</p>
    </article>

    <article class="submit-variant">
      <header class="submit-variant__header">
        <p class="submit-variant__eyebrow">Variant 3</p>
        <h3 class="submit-variant__title">Mode-First Composer</h3>
        <p class="submit-variant__desc">Asks the user to choose link or discussion first, then makes the form state feel purpose-built instead of generic.</p>
      </header>

      <div class="submit-variant__meta">
        <div>
          <strong>Explicit mode switch</strong>
          <span>Best if first-time posting clarity matters</span>
        </div>
        <span class="submit-variant__tag">mode-first</span>
      </div>

      <div class="mock-shell mode-layout">
        <div class="segmented-control">
          <span class="segment is-active">link post</span>
          <span class="segment">discussion</span>
        </div>

        <div class="two-pane-layout">
          <div class="form-card">
            <div class="panel-heading">
              <div>
                <h4>Submit a link</h4>
                <p>This version makes the URL feel primary and demotes the text field to optional context.</p>
              </div>
              <span class="pill">canonical url</span>
            </div>

            <div class="field-block">
              <div class="field-block__head">
                <label>URL</label>
                <span>This drives the preview</span>
              </div>
              <input value="https://github.com/ops-heavy/clusterpress" />
            </div>

            <div class="field-block">
              <div class="field-block__head">
                <label>Title</label>
                <span>Auto-suggest from linked page</span>
              </div>
              <input value="Show HN: A static markdown blog powered by an 8-node Kubernetes cluster" />
            </div>

            <div class="field-block">
              <div class="field-block__head">
                <label>Context</label>
                <span>Optional</span>
              </div>
              <textarea>Strongest when you want a very explicit difference between link posts and discussion posts rather than one neutral form doing both jobs.</textarea>
            </div>

            <div class="form-card__footer form-card__footer--tight">
              <button class="action-button action-button--ghost" type="button">switch to discussion</button>
              <button class="action-button action-button--primary" type="button">submit link</button>
            </div>
          </div>

          <div class="sidebar-stack">
            <div class="story-preview-card">
              <span class="story-preview-card__meta story-preview-card__meta--site">github.com</span>
              <h4>Show HN: A static markdown blog powered by an 8-node Kubernetes cluster</h4>
              <div class="story-preview-card__footer">
                <span>preview rank #1</span>
                <span>0 comments</span>
              </div>
              <p>The preview is treated as a direct reflection of the currently selected posting mode, not just a generic top strip.</p>
            </div>

            <div class="aside-card">
              <span class="aside-card__label">discussion mode behavior</span>
              <p>When switched, the URL card disappears, the text area expands, and the submit CTA label changes immediately.</p>
            </div>
          </div>
        </div>
      </div>

      <p class="submit-variant__note">Useful if the combined form keeps confusing first-time posters.</p>
    </article>

    <article class="submit-variant">
      <header class="submit-variant__header">
        <p class="submit-variant__eyebrow">Variant 4</p>
        <h3 class="submit-variant__title">Two-Column Draft Workshop</h3>
        <p class="submit-variant__desc">Treats submit as a drafting surface: form on the left, live story framing and guidelines on the right.</p>
      </header>

      <div class="submit-variant__meta">
        <div>
          <strong>Workspace feel</strong>
          <span>Most product-like without turning into a full editor</span>
        </div>
        <span class="submit-variant__tag">workshop</span>
      </div>

      <div class="mock-shell split-layout split-layout--balanced">
        <div class="form-card">
          <div class="pill-row">
            <span class="segment is-active">compose</span>
            <span class="segment">title polish</span>
            <span class="segment">preview</span>
          </div>

          <div class="field-block">
            <div class="field-block__head">
              <label>Title draft</label>
              <span>73 / 80 ideal</span>
            </div>
            <input value="Agent startup adds human fallback, accidentally ships customer support team" />
          </div>

          <div class="field-block">
            <div class="field-block__head">
              <label>URL</label>
              <span>Link post</span>
            </div>
            <input value="https://techcrunch.com/2026/03/11/agent-startup-human-fallback-customer-support-team/" />
          </div>

          <div class="field-block">
            <div class="field-block__head">
              <label>Context note</label>
              <span>Visible at top of thread</span>
            </div>
            <textarea>The architecture diagram still shows seven autonomous reasoning layers, but most incidents now appear to be resolved by someone named Priya with a keyboard.</textarea>
          </div>

          <div class="metric-strip">
            <div class="metric-card">
              <strong>73</strong>
              <span>title chars</span>
            </div>
            <div class="metric-card">
              <strong>link</strong>
              <span>post mode</span>
            </div>
            <div class="metric-card">
              <strong>clear</strong>
              <span>preview tone</span>
            </div>
          </div>

          <div class="form-card__footer form-card__footer--tight">
            <button class="action-button action-button--ghost" type="button">compare alternates</button>
            <button class="action-button action-button--primary" type="button">publish draft</button>
          </div>
        </div>

        <div class="sidebar-stack">
          <div class="story-preview-card">
            <span class="story-preview-card__meta">front page preview</span>
            <h4>Agent startup adds human fallback, accidentally ships customer support team</h4>
            <p>This side of the page stays persistent while the form changes, making the preview feel more dependable for longer edits.</p>
            <div class="story-preview-card__footer">
              <span>techcrunch.com</span>
              <span>by you</span>
            </div>
          </div>

          <div class="aside-card">
            <span class="aside-card__label">posting heuristics</span>
            <ul class="checklist">
              <li>Avoid title framing that sounds like launch copy</li>
              <li>Use text for why the link matters, not a full recap</li>
              <li>If the text stands alone, this might be Ask HN instead</li>
            </ul>
          </div>
        </div>
      </div>

      <p class="submit-variant__note">This is the most product-like option if submit is becoming a more serious drafting surface.</p>
    </article>

    <article class="submit-variant">
      <header class="submit-variant__header">
        <p class="submit-variant__eyebrow">Variant 5</p>
        <h3 class="submit-variant__title">Dense Minimal Stack</h3>
        <p class="submit-variant__desc">Drops nearly all decorative framing and leans into a calmer, denser treatment that feels closer to classic HN efficiency.</p>
      </header>

      <div class="submit-variant__meta">
        <div>
          <strong>Low chrome</strong>
          <span>Closer to a utility page than a product page</span>
        </div>
        <span class="submit-variant__tag">compact</span>
      </div>

      <div class="mock-shell">
        <div class="stack-note">A version for people who want the redesign to feel lighter and less editorial.</div>

        <div class="form-card form-card--compact">
          <div class="field-block field-block--plain">
            <label>Title</label>
            <input value="The mathematical inefficiency of the space bar" />
          </div>

          <div class="field-block field-block--plain">
            <label>URL</label>
            <input value="https://blog.hendricks.dev/posts/the-mathematical-inefficiency-of-the-space-bar/" />
          </div>

          <div class="field-block field-block--plain">
            <label>Text</label>
            <textarea placeholder="Optional context"></textarea>
          </div>

          <div class="story-preview-card story-preview-card--compact">
            <span class="story-preview-card__meta">preview</span>
            <h4>The mathematical inefficiency of the space bar</h4>
            <div class="story-preview-card__footer">
              <span>hendricks.dev</span>
              <span>0 comments</span>
            </div>
          </div>

          <div class="form-card__footer">
            <p>Minimal framing, same fields, same story preview.</p>
            <button class="action-button action-button--primary" type="button">submit</button>
          </div>
        </div>
      </div>

      <p class="submit-variant__note">Worth considering if the current page feels a little too product-heavy for a utility workflow.</p>
    </article>

    <article class="submit-variant">
      <header class="submit-variant__header">
        <p class="submit-variant__eyebrow">Variant 6</p>
        <h3 class="submit-variant__title">Guided Posting Storyboard</h3>
        <p class="submit-variant__desc">Frames the submit flow as three short decisions instead of one long form, while still keeping everything on one page.</p>
      </header>

      <div class="submit-variant__meta">
        <div>
          <strong>Most structured</strong>
          <span>Guidance-heavy without becoming a real wizard</span>
        </div>
        <span class="submit-variant__tag">guided flow</span>
      </div>

      <div class="mock-shell storyboard-layout">
        <div class="storyboard-card">
          <div class="step-card">
            <span class="step-card__index">1</span>
            <div>
              <h4>Choose the post shape</h4>
              <p>Link post, discussion, or Show HN. This changes helper copy but not the overall page.</p>
            </div>
          </div>

          <div class="step-card">
            <span class="step-card__index">2</span>
            <div>
              <h4>Write the front-page version</h4>
              <p>Start from the title and preview, then fill in the supporting fields only where needed.</p>
            </div>
          </div>

          <div class="step-card">
            <span class="step-card__index">3</span>
            <div>
              <h4>Check the thread opener</h4>
              <p>The thread intro and preview card stay nearby so the final post shape is never hidden.</p>
            </div>
          </div>
        </div>

        <div class="sidebar-stack">
          <div class="form-card">
            <div class="segmented-control">
              <span class="segment">link post</span>
              <span class="segment is-active">show hn</span>
            </div>

            <div class="field-block">
              <label>Title</label>
              <input value="Show HN: An app that blocks Slack until you finish the document you said you wrote" />
            </div>

            <div class="field-block">
              <label>URL</label>
              <input value="https://github.com/draftfirst/slacklock" />
            </div>

            <div class="field-block">
              <label>Text</label>
              <textarea>Storyboard language helps newer posters without turning submit into a multi-step wizard.</textarea>
            </div>

            <button class="action-button action-button--primary" type="button">submit show hn</button>
          </div>

          <div class="wireframe-card">
            <span class="wireframe-card__line wireframe-card__line--short"></span>
            <span class="wireframe-card__block"></span>
            <span class="wireframe-card__line"></span>
            <span class="wireframe-card__line wireframe-card__line--medium"></span>
            <span class="wireframe-card__block"></span>
          </div>
        </div>
      </div>

      <p class="submit-variant__note">Most opinionated option. Good if you want stronger onboarding for infrequent posters.</p>
    </article>

    <article class="submit-variant">
      <header class="submit-variant__header">
        <p class="submit-variant__eyebrow">Variant 7</p>
        <h3 class="submit-variant__title">Classic Utility Stack</h3>
        <p class="submit-variant__desc">A simpler return toward utility-page behavior: one compact stack, one quiet preview line, and fewer framed sub-sections.</p>
      </header>

      <div class="submit-variant__meta">
        <div>
          <strong>Low ceremony</strong>
          <span>Closest to a classic Hacker News utility page</span>
        </div>
        <span class="submit-variant__tag">utility</span>
      </div>

      <div class="mock-shell mock-shell--minimal">
        <div class="utility-links">
          <a href="#">bookmarklet</a>
          <span>/</span>
          <a href="#">guidelines</a>
        </div>

        <div class="mock-title-block mock-title-block--tight">
          <h4>Submit a link or start a discussion</h4>
          <p>Keep the form compact and let the content do the work.</p>
        </div>

        <div class="inline-preview-row">
          <strong>Preview</strong>
          <span>YC founders pivot after learning users prefer products that work</span>
          <span>medium.com</span>
        </div>

        <div class="form-card form-card--plain">
          <div class="field-block field-block--plain">
            <label>Title</label>
            <input value="YC founders pivot after learning users prefer products that work" />
          </div>

          <div class="field-block field-block--plain">
            <label>URL</label>
            <input value="https://medium.com/@reliablemoat/users-prefer-products-that-work-9f41c5e2b7da" />
          </div>

          <div class="field-block field-block--plain">
            <label>Text</label>
            <textarea placeholder="Optional context"></textarea>
          </div>

          <div class="form-card__footer">
            <p>Minimal framing. Same submit mechanics.</p>
            <button class="action-button action-button--primary" type="button">submit</button>
          </div>
        </div>
      </div>

      <p class="submit-variant__note">Best if the current page feels too productized for a simple posting workflow.</p>
    </article>

    <article class="submit-variant">
      <header class="submit-variant__header">
        <p class="submit-variant__eyebrow">Variant 8</p>
        <h3 class="submit-variant__title">Discussion-First Minimal</h3>
        <p class="submit-variant__desc">Optimizes around Ask HN style submissions by letting title and text dominate while keeping the optional URL quiet.</p>
      </header>

      <div class="submit-variant__meta">
        <div>
          <strong>Ask HN biased</strong>
          <span>Simple layout for discussion posts first, link posts second</span>
        </div>
        <span class="submit-variant__tag">discussion</span>
      </div>

      <div class="mock-shell mock-shell--minimal">
        <div class="form-card form-card--plain">
          <div class="field-block field-block--plain">
            <label>Title</label>
            <input value="Ask HN: Is there a polite way to say 'your startup could be a cron job'?" />
          </div>

          <div class="field-block field-block--plain">
            <label>Text</label>
            <textarea>A founder friend keeps describing an AI-native orchestration layer that sounds increasingly like one scheduled task and a Stripe webhook. Looking for phrasing that preserves the friendship.</textarea>
          </div>

          <div class="field-block field-block--plain field-block--muted">
            <label>URL</label>
            <input placeholder="Optional for discussion posts" />
          </div>

          <div class="inline-hint-row">
            <span>Discussion mode keeps the optional URL visible but clearly secondary.</span>
          </div>

          <div class="form-card__footer form-card__footer--tight">
            <button class="action-button action-button--primary" type="button">submit discussion</button>
          </div>
        </div>
      </div>

      <p class="submit-variant__note">Useful if discussion posts are the dominant use case and the current neutral form feels over-generalized.</p>
    </article>

    <article class="submit-variant">
      <header class="submit-variant__header">
        <p class="submit-variant__eyebrow">Variant 9</p>
        <h3 class="submit-variant__title">Ledger Form With Inline Guidance</h3>
        <p class="submit-variant__desc">Uses a simpler ledger rhythm: compact helper lines between fields, no sidebars, and a single compact preview at the end.</p>
      </header>

      <div class="submit-variant__meta">
        <div>
          <strong>Guidance without boxes</strong>
          <span>Hints live inline instead of inside separate cards</span>
        </div>
        <span class="submit-variant__tag">ledger</span>
      </div>

      <div class="mock-shell mock-shell--minimal">
        <div class="form-card form-card--plain">
          <div class="field-block field-block--plain">
            <label>Title</label>
            <input value="Show HN: A static markdown blog powered by an 8-node Kubernetes cluster" />
          </div>

          <div class="inline-hint-row">
            <span>Keep the title faithful to the source and avoid launch-copy phrasing.</span>
          </div>

          <div class="field-block field-block--plain">
            <label>URL</label>
            <input value="https://github.com/ops-heavy/clusterpress" />
          </div>

          <div class="inline-hint-row">
            <span>Canonical URLs when possible. Leave blank for Ask HN.</span>
          </div>

          <div class="field-block field-block--plain">
            <label>Text</label>
            <textarea>Optional context for the thread opener. Keep it short and additive.</textarea>
          </div>

          <div class="inline-preview-row inline-preview-row--story">
            <strong>Preview</strong>
            <span>Show HN: A static markdown blog powered by an 8-node Kubernetes cluster</span>
            <span>github.com</span>
            <span>0 comments</span>
          </div>

          <div class="form-card__footer">
            <p>Compact guidance, compact preview, standard submit flow.</p>
            <button class="action-button action-button--primary" type="button">submit post</button>
          </div>
        </div>
      </div>

      <p class="submit-variant__note">Good when you want more coaching than classic HN, but much less chrome than the editorial concepts.</p>
    </article>
  </section>
</template>

<style scoped lang="scss" src="./submit-concepts.scss"></style>
