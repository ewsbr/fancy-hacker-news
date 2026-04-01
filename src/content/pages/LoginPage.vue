<script setup lang="ts">
import { inject, ref, computed } from 'vue';
import { ArrowRight, UserPlus, HelpCircle, ArrowLeft } from 'lucide-vue-next';
import type { ParsedLoginPage } from '@/parsers/login';
import YLogo from '@/assets/ycombinator.svg';

const page = inject<ParsedLoginPage>('pageData')!;

const isLogin = ref(true);

const loginForm = computed(() => 
  page.forms.find(f => f.submitLabel.toLowerCase().includes('login')) || page.forms[0]
);

const registerForm = computed(() => 
  page.forms.find(f => f.submitLabel.toLowerCase().includes('create'))
);

const currentForm = computed(() => {
  if (page.variant !== 'login') return page.forms[0];
  return isLogin.value ? loginForm.value : (registerForm.value || loginForm.value);
});

const canToggle = computed(() => page.variant === 'login' && registerForm.value);

const title = computed(() => {
  if (page.variant !== 'login') return page.title;
  return isLogin.value ? 'Welcome back' : 'Create an account';
});

const subheader = computed(() => {
  if (page.variant !== 'login') return 'Reset your password to continue';
  return isLogin.value 
    ? 'Sign in to your account to continue' 
    : 'Join the Hacker News community';
});

function getPlaceholder(label: string) {
  const l = label.toLowerCase();
  if (l.includes('username')) return 'Your HN username';
  if (l.includes('password')) return '••••••••';
  return '';
}
</script>

<template>
  <div class="login-container">
    <div class="login-content">
      <!-- Header Section -->
      <header class="login-header">
        <div class="login-logo">
          <img :src="YLogo" class="login-logo__img" alt="Y Combinator Logo" />
        </div>
        <h1 class="login-header__title">{{ title }}</h1>
        <p class="login-header__subheader">{{ subheader }}</p>
      </header>

      <!-- Form Card -->
      <div v-if="page.authMessage" class="login-message">
        {{ page.authMessage }}
      </div>

      <main class="login-card">
        <div v-if="!currentForm" class="login-card__empty">
          No authentication forms found.
        </div>
        
        <form 
          v-else
          :action="currentForm.action" 
          :method="currentForm.method"
          class="login-form"
        >
          <!-- Hidden CSRF/State Fields -->
          <input
            v-for="f in currentForm.hiddenFields"
            :key="f.name"
            type="hidden"
            :name="f.name"
            :value="f.value"
          />

          <div class="login-form__fields">
            <div 
              v-for="field in currentForm.visibleFields" 
              :key="field.name" 
              class="login-form__field"
            >
              <label :for="field.name" class="login-form__label">{{ field.label }}</label>
              <input 
                :id="field.name"
                :type="field.type" 
                :name="field.name"
                :defaultValue="field.value"
                class="login-form__input"
                :placeholder="getPlaceholder(field.label)"
                :autofocus="field.type === 'text' || field.name === 's'"
                autocomplete="on"
                required
              />
            </div>
          </div>

          <!-- Actions Row (Forgot Password inside Login state) -->
          <div v-if="page.variant === 'login' && isLogin" class="login-form__actions">
            <div class="login-form__forgot">
              <a href="/forgot" class="login-form__forgot-link">
                <HelpCircle :size="13" />
                Forgot password?
              </a>
            </div>
          </div>

          <button 
            type="submit" 
            class="login-form__submit"
          >
            <UserPlus v-if="page.variant === 'login' && !isLogin" :size="16" />
            {{ isLogin ? 'Sign in' : 'Create account' }}
            <ArrowRight v-if="page.variant === 'login' && isLogin" :size="16" />
          </button>
        </form>
      </main>

      <!-- Footer Toggle / Navigation -->
      <footer v-if="canToggle || page.variant === 'forgot'" class="login-footer">
        <template v-if="canToggle">
          <span class="login-footer__text">
            {{ isLogin ? "Don't have an account? " : "Already have an account? " }}
          </span>
          <button 
            type="button"
            @click="isLogin = !isLogin"
            class="login-footer__btn"
          >
            {{ isLogin ? 'Sign up' : 'Sign in' }}
          </button>
        </template>
        
        <template v-else-if="page.variant === 'forgot'">
          <a href="/login" class="login-footer__btn login-footer__btn--back">
            <ArrowLeft :size="14" />
            Back to login
          </a>
        </template>
      </footer>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 4rem;
  padding-bottom: 6rem;
  min-height: calc(100vh - 40px);
  background: var(--color-bg);
}

.login-content {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  &__title {
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: var(--color-text);
    font-family: var(--font-title);
  }

  &__subheader {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }
}

.login-logo {
  margin-bottom: 1.5rem;

  &__img {
    width: 44px;
    height: 44px;
    background: var(--color-accent);
  }
}

.login-message {
  padding: 0.75rem 1rem;
  background: color-mix(in srgb, var(--color-accent) 5%, var(--color-surface));
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  font-size: 0.85rem;
  text-align: center;
}

.login-card {
  background: var(--color-surface);
  padding: 2.25rem 2rem;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-elevation);
  border-radius: 4px;

  &__empty {
    text-align: center;
    color: var(--color-text-muted);
    padding: 2rem;
    border: 1px dashed var(--color-border);
    border-radius: 4px;
  }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  &__fields {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  &__label {
    font-size: 0.725rem;
    font-weight: 800;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__input {
    width: 100%;
    padding: 0.625rem 0.875rem;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: var(--color-surface);
    color: var(--color-text);
    font-family: inherit;
    font-size: 0.9rem;
    transition: all 0.15s ease;

    &::placeholder {
      color: var(--color-text-muted);
      opacity: 0.4;
    }

    &:focus {
      outline: none;
      border-color: var(--color-accent);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 15%, transparent);
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  &__forgot {
  }

  &__forgot-link {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-accent);
    display: flex;
    align-items: center;
    gap: 0.35rem;

    &:hover {
      text-decoration: underline;
    }
  }

  &__submit {
    width: 100%;
    padding: 0.6rem 1rem;
    background: color-mix(in srgb, var(--color-accent) 90%, black);
    color: #fff;
    border: 1px solid transparent;
    border-radius: 4px;
    font-size: 0.88rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.15s ease;

    &:hover {
      background: var(--color-accent);
    }

    &:active {
      transform: translateY(1px);
    }
  }
}

.login-footer {
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-text-muted);

  &__text {
  }

  &__btn {
    background: none;
    border: none;
    color: var(--color-accent);
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    margin-left: 0.25rem;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }

    &--back {
    }
  }
}
</style>
