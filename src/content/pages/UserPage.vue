<script setup lang="ts">
import { inject } from 'vue';
import { Save, FileText, MessageSquare, Star, ArrowUp, HelpCircle } from 'lucide-vue-next';
import Tooltip from '@/content/shared/Tooltip.vue';
import type { ParsedUserPage } from '@/parsers/user';

const user = inject<ParsedUserPage>('pageData')!;
</script>

<template>
  <div class="user-page">
    <header class="user-page__header">
      <div class="user-page__identity">
        <h1 class="user-page__username">{{ user.username }}</h1>
        <div class="user-page__meta">
          <span>Joined <a :href="user.createdLink" class="user-page__meta-link">{{ user.created }}</a></span>
          <span v-if="user.isOwnProfile" class="user-page__badge">You</span>
        </div>
      </div>
      <div class="user-page__karma">
        <span class="user-page__karma-val">{{ user.karma.toLocaleString() }}</span>
        <span class="user-page__karma-lbl">Karma</span>
      </div>
    </header>

    <div class="user-page__columns">
      <div class="user-page__main">
        <!-- Edit Form / Display About -->
        <section class="user-page__section">
          <h2 class="user-page__section-title"><span>about</span></h2>
          <template v-if="user.isOwnProfile && user.editForm">
            <textarea name="about" form="profileform" class="user-page__textarea" rows="4">{{ user.about }}</textarea>
            <a href="formatdoc" class="user-page__help" target="_blank">Formatting help</a>
          </template>
          <div v-else-if="user.about" v-html="user.about" class="user-page__about-html" />
          <div v-else class="user-page__empty">No bio provided.</div>
        </section>

        <!-- Settings -->
        <section class="user-page__section" v-if="user.isOwnProfile && user.editForm">
          <h2 class="user-page__section-title"><span>settings</span></h2>
          <div class="user-page__settings">
            <div class="user-page__field">
              <span class="user-page__label">
                Email
                <Tooltip content="Your email address for notifications and account recovery. This is only visible to you.">
                  <HelpCircle :size="11" class="user-page__label-help" />
                </Tooltip>
              </span>
              <div class="user-page__input-col">
                <input type="text" name="email" form="profileform" :value="user.email" class="user-page__input" />
                <a v-if="user.changePwLink" :href="user.changePwLink" class="user-page__pw-link">change password</a>
              </div>
            </div>
            <div class="user-page__field">
              <span class="user-page__label">
                Show dead
                <Tooltip content="Display posts flagged as dead by moderators or the community.">
                  <HelpCircle :size="11" class="user-page__label-help" />
                </Tooltip>
              </span>
              <select name="showd" form="profileform" class="user-page__input" :value="user.preferences?.showDead">
                <option value="yes">yes</option>
                <option value="no">no</option>
              </select>
            </div>
            <div class="user-page__field">
              <span class="user-page__label">
                No procrast
                <Tooltip content="Enforce visit-time limits to reduce procrastination.">
                  <HelpCircle :size="11" class="user-page__label-help" />
                </Tooltip>
              </span>
              <select name="nopro" form="profileform" class="user-page__input" :value="user.preferences?.noprocrast">
                <option value="yes">yes</option>
                <option value="no">no</option>
              </select>
            </div>
            <div class="user-page__field">
              <span class="user-page__label">
                Max visit
                <Tooltip content="Maximum minutes per visit when Noprocrast is enabled.">
                  <HelpCircle :size="11" class="user-page__label-help" />
                </Tooltip>
              </span>
              <input type="text" name="maxv" form="profileform" :value="user.preferences?.maxVisit" class="user-page__input user-page__input--short" />
            </div>
            <div class="user-page__field">
              <span class="user-page__label">
                Min away
                <Tooltip content="Minimum minutes away between visits when Noprocrast is enabled.">
                  <HelpCircle :size="11" class="user-page__label-help" />
                </Tooltip>
              </span>
              <input type="text" name="mina" form="profileform" :value="user.preferences?.minAway" class="user-page__input user-page__input--short" />
            </div>
            <div class="user-page__field">
              <span class="user-page__label">
                Delay
                <Tooltip content="Minutes before your comments appear to others, giving you time to edit them.">
                  <HelpCircle :size="11" class="user-page__label-help" />
                </Tooltip>
              </span>
              <input type="text" name="delay" form="profileform" :value="user.preferences?.delay" class="user-page__input user-page__input--short" />
            </div>
          </div>

          <div class="user-page__actions">
            <form id="profileform" :action="user.editForm.action" method="post">
              <input type="hidden" name="id" :value="user.editForm.userId" />
              <input type="hidden" name="hmac" :value="user.editForm.hmac" />
              <button type="submit" class="user-page__btn">
                <Save :size="13" class="user-page__btn-icon" />
                update profile
              </button>
            </form>
          </div>
        </section>
      </div>

      <div class="user-page__sidebar">
        <!-- Activity & Nav Links -->
        <section class="user-page__section">
          <h2 class="user-page__section-title"><span>activity</span></h2>
          <div class="user-page__links">
            <a :href="user.submissionsLink" class="user-page__link">
              <FileText :size="14" class="user-page__link-icon" />
              Submissions
            </a>
            <a :href="user.threadsLink" class="user-page__link">
              <MessageSquare :size="14" class="user-page__link-icon" />
              Comments
            </a>

            <template v-if="user.favoritesLink">
              <div class="user-page__group">
                <div class="user-page__group-header">
                  <Star :size="14" class="user-page__link-icon" />
                  Favorites
                </div>
                <div class="user-page__group-items">
                  <a :href="user.favoritesLink" class="user-page__sublink">Stories</a>
                  <span class="user-page__sep">/</span>
                  <a :href="user.favoritesCommentsLink || '#'" class="user-page__sublink">Comments</a>
                </div>
              </div>
            </template>

            <template v-if="user.upvotedLink">
              <div class="user-page__group">
                <div class="user-page__group-header">
                  <ArrowUp :size="14" class="user-page__link-icon" />
                  Upvoted
                </div>
                <div class="user-page__group-items">
                  <a :href="user.upvotedLink" class="user-page__sublink">Stories</a>
                  <span class="user-page__sep">/</span>
                  <a :href="user.upvotedCommentsLink || '#'" class="user-page__sublink">Comments</a>
                </div>
              </div>
            </template>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.user-page {
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem 4rem;
  max-width: 800px;
  margin: 0 auto;

  &__columns {
    display: flex;
    flex-direction: column;
    gap: 3rem;

    @media (min-width: 768px) {
      flex-direction: row;
      gap: 4rem;
    }
  }

  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
    min-width: 0; // Prevent flex item from overflowing
  }

  &__sidebar {
    @media (min-width: 768px) {
      width: 250px;
      flex-shrink: 0;
    }
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 2rem;
  }

  &__identity {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  &__username {
    font-size: 1.75rem;
    font-weight: 700;
    line-height: 1;
    color: var(--color-text);
    margin: 0;
    font-family: var(--font-title);
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.85rem;
    color: var(--color-text-muted);
  }

  &__meta-link {
    color: var(--color-text);
    text-decoration: underline;
    text-decoration-color: transparent;
    transition: text-decoration-color 0.15s ease;

    &:hover {
      text-decoration-color: var(--color-text-muted);
    }
  }

  &__badge {
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.1rem 0.4rem;
    border-radius: 3px;
    background: var(--color-accent-badge-bg);
    border: 1px solid var(--color-accent-badge-border);
    color: var(--color-accent);
  }

  &__karma {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  &__karma-val {
    font-size: 1.5rem;
    font-weight: 800;
    line-height: 1;
    color: var(--color-accent);
    font-variant-numeric: tabular-nums;
  }

  &__karma-lbl {
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
    margin-top: 0.2rem;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__section-title {
    font-family: var(--font-title);
    font-size: 0.95rem;
    font-weight: 800;
    text-transform: lowercase;
    color: var(--color-text-muted);
    margin: 0;
    display: flex;
    align-items: center;

    span {
      color: var(--color-text);
    }

    &::before {
      content: "[ ";
      opacity: 0.3;
    }

    &::after {
      content: " ]";
      opacity: 0.3;
    }
  }

  &__textarea {
    width: 100%;
    min-height: 120px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    color: var(--color-text);
    padding: 0.75rem;
    font-size: 0.9rem;
    font-family: var(--font-sans);
    line-height: 1.5;
    resize: vertical;

    &:focus {
      outline: none;
      border-color: var(--color-accent);
      box-shadow: 0 0 0 2px var(--color-focus-ring);
    }
  }

  &__help {
    align-self: flex-end;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    text-decoration: underline;
    text-decoration-color: transparent;

    &:hover {
      text-decoration-color: var(--color-text-muted);
      color: var(--color-text);
    }
  }

  &__about-html {
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--color-text);

    :deep(p) {
      margin-top: 0;
      margin-bottom: 0.75rem;
      &:last-child {
        margin-bottom: 0;
      }
    }

    :deep(a) {
      color: var(--color-text);
      text-decoration: underline;
      text-underline-offset: 2px;
      &:hover {
        color: var(--color-accent);
      }
    }
  }

  &__empty {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    font-style: italic;
  }

  // Settings Grid
  &__settings {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__field {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    flex-direction: column;

    @media (min-width: 480px) {
      flex-direction: row;
      align-items: center;
    }
  }

  &__label {
    min-width: 100px;
    font-size: 0.85rem;
    color: var(--color-text-muted);
    padding-top: 0.2rem;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;

    @media (min-width: 480px) {
      padding-top: 0;
    }
  }

  &__label-help {
    color: var(--color-text-muted);
    opacity: 0.5;
    flex-shrink: 0;
  }

  &__input-col {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
    width: 100%;
  }

  &__pw-link {
    align-self: end;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    text-decoration: underline;
    text-decoration-color: transparent;
    transition: all 0.15s ease;
    
    &:hover {
      color: var(--color-text);
      text-decoration-color: currentColor;
    }
  }

  &__input {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    padding: 0.4rem 0.6rem;
    border-radius: 4px;
    font-size: 0.85rem;
    width: 100%;

    &--short {
      max-width: 100px;
    }

    &:focus {
      outline: none;
      border-color: var(--color-accent);
      box-shadow: 0 0 0 2px var(--color-focus-ring);
    }
  }

  // Buttons
  &__actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--color-border);
  }

  &__btn {
    cursor: pointer;
    border-radius: 4px;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    padding: 0.35rem 1rem;
    font-weight: 700;
    font-family: var(--font-title);
    font-size: 0.82rem;
    color: var(--color-text);
    display: flex;
    align-items: center;
    gap: 0.4rem;
    transition: all 0.1s ease;

    &:hover {
      background: var(--color-accent);
      border-color: var(--color-accent);
      color: white;

      .user-page__btn-icon {
        color: white;
      }
    }

    &:active {
      transform: translateY(1px);
    }

    &:focus {
      border-color: var(--color-accent);
      outline: none;
      box-shadow: 0 0 0 2px var(--color-focus-ring);
    }
  }

  &__btn-icon {
    color: var(--color-accent);
    transition: color 0.1s ease;
  }

  // Links group
  &__links {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--color-text);
    text-decoration: none;
    padding: 0.4rem 0.5rem;
    margin-left: -0.5rem;
    border-radius: 4px;
    transition: all 0.15s ease;

    &:hover {
      background: var(--color-surface);
      color: var(--color-accent);

      .user-page__link-icon {
        color: var(--color-accent);
      }
    }
  }

  &__link-icon {
    color: var(--color-text-muted);
    transition: color 0.15s ease;
  }

  &__group {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.4rem 0.5rem;
    margin-left: -0.5rem;
    border-radius: 4px;
    transition: background 0.15s ease;

    &:hover {
      background: var(--color-surface);
    }
  }

  &__group-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--color-text-muted);
  }

  &__group-items {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding-left: calc(14px + 0.5rem); // Icon width + gap
  }

  &__sublink {
    font-size: 0.82rem;
    color: var(--color-text);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
      color: var(--color-accent);
    }
  }

  &__sep {
    color: var(--color-border);
    font-size: 0.85rem;
  }
}
</style>
