/**
 * Parse HN login / changepw / forgot / comment auth pages.
 */
import { textOf } from './utils';

export interface FormField {
  label: string;
  name: string;
  type: string;
  value: string;
}

export interface LoginForm {
  title: string | null;
  action: string;
  method: string;
  visibleFields: FormField[];
  hiddenFields: { name: string; value: string }[];
  submitLabel: string;
}

export interface ParsedLoginPage {
  variant: 'login' | 'changepw' | 'forgot' | 'comment' | 'auth-gate';
  title: string;
  authMessage: string | null;
  forms: LoginForm[];
}

export function parseLoginPage(doc: Document): ParsedLoginPage {
  const path = location.pathname;

  // Extract "You have to be logged in to X." message, if present
  const bodyText = doc.body?.textContent?.trim() || '';
  const authMsgMatch = bodyText.match(/^You have to be logged in to ([^.]+)\./i);
  const authMessage = authMsgMatch ? authMsgMatch[0] : null;

  let variant: ParsedLoginPage['variant'] = authMessage ? 'auth-gate' : 'login';
  let title = authMessage ?? 'Login';
  if (path === '/changepw') { variant = 'changepw'; title = 'Change Password'; }
  else if (path === '/forgot') { variant = 'forgot'; title = 'Reset Password'; }
  else if (path === '/comment') { variant = 'comment'; title = 'Login to Comment'; }

  const hnmain = doc.querySelector('table#hnmain');
  const context = hnmain || doc.body;

  const forms: LoginForm[] = [];
  const formEls = Array.from(context.querySelectorAll('form'));
  
  for (const form of formEls) {
    const action = form.getAttribute('action') ?? 'login';
    const method = form.getAttribute('method') ?? 'post';
    
    // Find previous <b> or text node for form title
    let formTitle: string | null = null;
    let prev = form.previousElementSibling;
    while (prev && prev.tagName === 'BR') prev = prev.previousElementSibling;
    if (prev && prev.tagName === 'B') {
      formTitle = textOf(prev);
    }
  
    const hiddenFields: { name: string; value: string }[] = [];
    for (const el of form.querySelectorAll<HTMLInputElement>('input[type=hidden]')) {
      hiddenFields.push({ name: el.name, value: el.value });
    }
  
    const submitEl = form.querySelector<HTMLInputElement>('input[type=submit]');
    const submitLabel = submitEl?.value ?? 'login';
  
    const visibleFields: FormField[] = [];
    for (const row of form.querySelectorAll('tr')) {
      const tds = row.querySelectorAll('td');
      if (tds.length < 2) continue;
      const input = tds[1].querySelector<HTMLInputElement>('input:not([type=hidden]):not([type=submit])');
      if (!input) continue;
      visibleFields.push({
        label: textOf(tds[0]).replace(/:$/, ''),
        name: input.name,
        type: input.type || 'text',
        value: input.value,
      });
    }
    
    forms.push({
      title: formTitle,
      action,
      method,
      visibleFields,
      hiddenFields,
      submitLabel
    });
  }

  return { variant, title, authMessage, forms };
}
