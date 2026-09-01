// @vitest-environment jsdom

import type { ParsedLoginPage } from '@/parsers/login';
import { describe, expect, it } from 'vitest';
import LoginPage from '@/content/pages/LoginPage.vue';
import { mountComponent } from '../helpers/mount-component';

describe('login page', () => {
  it('marks login credentials for password managers and toggles password visibility', async () => {
    const page: ParsedLoginPage = {
      variant: 'login',
      title: 'Login',
      authMessage: null,
      forms: [
        {
          title: null,
          action: 'login',
          method: 'post',
          visibleFields: [
            { label: 'username', name: 'acct', type: 'text', value: '' },
            { label: 'password', name: 'pw', type: 'password', value: '' },
          ],
          hiddenFields: [],
          submitLabel: 'login',
        },
        {
          title: null,
          action: 'login',
          method: 'post',
          visibleFields: [
            { label: 'username', name: 'acct', type: 'text', value: '' },
            { label: 'password', name: 'pw', type: 'password', value: '' },
          ],
          hiddenFields: [{ name: 'creating', value: 't' }],
          submitLabel: 'create account',
        },
      ],
    };
    const wrapper = mountComponent(LoginPage, {
      global: {
        provide: { pageData: page },
      },
    });

    expect(wrapper.get('input[name="acct"]').attributes('autocomplete')).toBe('username');

    const password = wrapper.get('input[name="pw"]');
    const visibilityToggle = wrapper.get('button[aria-label="Show password"]');
    expect(password.attributes()).toMatchObject({
      type: 'password',
      autocomplete: 'current-password',
    });
    expect(visibilityToggle.attributes('aria-pressed')).toBe('false');

    await visibilityToggle.trigger('click');

    expect(password.attributes('type')).toBe('text');
    expect(visibilityToggle.attributes()).toMatchObject({
      'aria-label': 'Hide password',
      'aria-pressed': 'true',
    });

    await wrapper.get('.login-footer__btn').trigger('click');

    expect(wrapper.get('input[name="acct"]').attributes('autocomplete')).toBe('username');
    expect(wrapper.get('input[name="pw"]').attributes()).toMatchObject({
      type: 'password',
      autocomplete: 'new-password',
    });
  });

  it('distinguishes current and new passwords on the change-password form', () => {
    const page: ParsedLoginPage = {
      variant: 'changepw',
      title: 'Change Password',
      authMessage: null,
      forms: [{
        title: null,
        action: 'changepw',
        method: 'post',
        visibleFields: [
          { label: 'old password', name: 'oldpw', type: 'password', value: '' },
          { label: 'new password', name: 'pw', type: 'password', value: '' },
        ],
        hiddenFields: [],
        submitLabel: 'change password',
      }],
    };
    const wrapper = mountComponent(LoginPage, {
      global: {
        provide: { pageData: page },
      },
    });

    expect(wrapper.text()).toContain('Enter your current and new password');
    expect(wrapper.get('input[name="oldpw"]').attributes()).toMatchObject({
      type: 'password',
      autocomplete: 'current-password',
    });
    expect(wrapper.get('input[name="pw"]').attributes()).toMatchObject({
      type: 'password',
      autocomplete: 'new-password',
    });
    expect(wrapper.findAll('button[aria-label="Show password"]')).toHaveLength(2);
  });

  it('renders HN\'s rate-limit response instead of a missing-form error', () => {
    const page: ParsedLoginPage = {
      variant: 'rate-limited',
      title: 'Rate limited',
      authMessage: 'Sorry.',
      forms: [],
    };
    const wrapper = mountComponent(LoginPage, {
      global: {
        provide: { pageData: page },
      },
    });

    expect(wrapper.get('h1').text()).toBe('Rate limited');
    expect(wrapper.text()).toContain('Sorry.');
    expect(wrapper.text()).toContain('temporarily limited requests');
    expect(wrapper.text()).not.toContain('No authentication forms found.');
    expect(wrapper.find('main.login-card').exists()).toBe(false);
  });
});
