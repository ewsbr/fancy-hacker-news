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

export interface ParsedLoginPage {
  variant: 'login' | 'changepw' | 'forgot' | 'comment';
  title: string;
  formAction: string;
  formMethod: string;
  visibleFields: FormField[];
  hiddenFields: { name: string; value: string }[];
  submitLabel: string;
}

export function parseLoginPage(doc: Document): ParsedLoginPage {
  const path = location.pathname;

  let variant: ParsedLoginPage['variant'] = 'login';
  let title = 'Login';
  if (path === '/changepw') { variant = 'changepw'; title = 'Change Password'; }
  else if (path === '/forgot') { variant = 'forgot'; title = 'Reset Password'; }
  else if (path === '/comment') { variant = 'comment'; title = 'Login to Comment'; }

  const form = doc.querySelector('table#hnmain form') as HTMLFormElement | null;

  if (!form) {
    return { variant, title, formAction: 'login', formMethod: 'post', visibleFields: [], hiddenFields: [], submitLabel: 'login' };
  }

  const formAction = form.getAttribute('action') ?? 'login';
  const formMethod = form.getAttribute('method') ?? 'post';

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

  return { variant, title, formAction, formMethod, visibleFields, hiddenFields, submitLabel };
}
