<script setup lang="ts">
import type { ParsedUserPage } from '@/parsers/user';

defineProps<{
  user: ParsedUserPage;
}>();
</script>

<template>
  <div class="user-profile">
    <table class="user-profile__table">
      <tbody>
        <tr>
          <th>user:</th>
          <td>
            <a :href="`user?id=${user.username}`" class="user-profile__username" :class="{'user-profile__username--new': false}">{{ user.username }}</a>
          </td>
        </tr>
        <tr>
          <th>created:</th>
          <td><a :href="user.createdLink">{{ user.created }}</a></td>
        </tr>
        <tr>
          <th>karma:</th>
          <td>{{ user.karma }}</td>
        </tr>
        <tr>
          <th>about:</th>
          <td>
            <div v-if="user.isOwnProfile && user.editForm" class="user-profile__field">
              <textarea name="about" form="profileform" class="user-profile__textarea" rows="5" wrap="virtual">{{ user.about }}</textarea>
              <a href="formatdoc" tabindex="-1" class="user-profile__help-link">help</a>
            </div>
            <div v-else-if="user.about" class="user-profile__about-text" v-html="user.about"></div>
          </td>
        </tr>
        <tr v-if="user.isOwnProfile && user.editForm">
          <th>email:</th>
          <td>
            <div class="user-profile__field">
              <input type="text" name="email" form="profileform" :value="user.email" class="user-profile__input" size="60" />
            </div>
          </td>
        </tr>
        <tr v-if="user.isOwnProfile && user.preferences">
          <th>showdead:</th>
          <td>
            <select name="showd" form="profileform" class="user-profile__select" :value="user.preferences.showDead">
              <option value="yes">yes</option>
              <option value="no">no</option>
            </select>
          </td>
        </tr>
        <tr v-if="user.isOwnProfile && user.preferences">
          <th>noprocrast:</th>
          <td>
            <select name="nopro" form="profileform" class="user-profile__select" :value="user.preferences.noprocrast">
              <option value="yes">yes</option>
              <option value="no">no</option>
            </select>
          </td>
        </tr>
        <tr v-if="user.isOwnProfile && user.preferences">
          <th>maxvisit:</th>
          <td>
            <input type="text" name="maxv" form="profileform" :value="user.preferences.maxVisit" class="user-profile__input" size="16" />
          </td>
        </tr>
        <tr v-if="user.isOwnProfile && user.preferences">
          <th>minaway:</th>
          <td>
            <input type="text" name="mina" form="profileform" :value="user.preferences.minAway" class="user-profile__input" size="16" />
          </td>
        </tr>
        <tr v-if="user.isOwnProfile && user.preferences">
          <th>delay:</th>
          <td>
            <input type="text" name="delay" form="profileform" :value="user.preferences.delay" class="user-profile__input" size="16" />
          </td>
        </tr>
        <tr v-if="user.isOwnProfile && user.editForm">
          <th></th>
          <td>
            <a v-if="user.changePwLink" :href="user.changePwLink" class="user-profile__action-link" style="margin-right: 1.5rem"><u>change password</u></a>
            <a :href="`submitted?id=${user.username}`" class="user-profile__action-link"><u>submissions</u></a>
          </td>
        </tr>
      </tbody>
    </table>

    <form v-if="user.isOwnProfile && user.editForm" id="profileform" :action="user.editForm.action" method="post" class="user-profile__form">
      <input type="hidden" name="id" :value="user.editForm.userId" />
      <input type="hidden" name="hmac" :value="user.editForm.hmac" />
      <button type="submit" class="user-profile__submit">Update profile</button>
    </form>
  </div>
</template>

<style scoped lang="scss">
.user-profile {
  font-family: var(--font-sans);

  &__table {
    border-collapse: collapse;
    width: 100%;
    max-width: 600px;

    th {
      text-align: right;
      vertical-align: top;
      color: var(--color-text-muted);
      font-weight: normal;
      padding: 0.5rem 1rem 0.5rem 0;
      white-space: nowrap;
      width: 1%;
    }

    td {
      padding: 0.5rem 0;
      vertical-align: middle;
      color: var(--color-text);

      a {
        color: inherit;
        text-decoration: none;

        &:not(.user-profile__action-link):hover {
          text-decoration: underline;
        }
      }
    }
  }

  &__username {
    color: var(--color-text) !important;
    font-weight: 500;
    
    &--new {
      color: var(--color-new-user) !important;
    }
  }

  &__about-text {
    line-height: 1.5;
    font-size: 0.95rem;
    overflow-wrap: break-word;
    word-break: break-word;

    :deep(a) {
      color: var(--color-text);
      text-decoration: underline;
      text-underline-offset: 2px;
      text-decoration-color: var(--color-border);
      
      &:hover {
        text-decoration-color: var(--color-text);
      }
    }

    :deep(p) { margin: 0.5em 0; }
  }

  &__field {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
  }

  &__textarea,
  &__input,
  &__select {
    width: 100%;
    max-width: 100%;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    padding: 0.5rem;
    font-family: var(--font-mono);
    font-size: 0.9rem;
    outline: none;

    &:focus {
      border-color: var(--color-accent);
    }
  }

  &__textarea {
    resize: vertical;
  }

  &__select {
    width: auto;
    cursor: pointer;
  }

  &__help-link {
    font-size: 0.75rem;
    color: var(--color-text-muted) !important;
    text-decoration: underline;

    &:hover {
      color: var(--color-text) !important;
    }
  }

  &__action-link {
    color: var(--color-text);

    &:hover {
      color: var(--color-accent) !important;
    }
  }

  &__form {
    margin-top: 1.5rem;
  }

  &__submit {
    background: var(--color-border);
    color: var(--color-text);
    border: none;
    padding: 0.5rem 1.5rem;
    font-weight: bold;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;

    &:hover {
      background: var(--color-text);
      color: var(--color-bg);
    }
  }
}
</style>
