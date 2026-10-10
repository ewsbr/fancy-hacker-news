/**
 * Parse HN login / changepw / forgot / comment auth pages.
 */
import { textOf } from './shared/dom';

export interface FormField {
  label: string;
  name: string;
  type: string;
  value: string;
}

export interface LoginForm {
  action: string;
  method: string;
  visibleFields: FormField[];
  hiddenFields: { name: string; value: string }[];
  submitLabel: string;
}

export interface ParsedLoginPage {
  variant: 'login' | 'changepw' | 'forgot' | 'comment' | 'auth-gate' | 'rate-limited';
  title: string;
  authMessage: string | null;
  forms: LoginForm[];
}

type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const VISIBLE_FIELD_SELECTOR = 'input:not([type=hidden]):not([type=submit]), select, textarea';
const PATH_VARIANTS: Record<string, { variant: ParsedLoginPage['variant']; title: string }> = {
  '/changepw': { variant: 'changepw', title: 'Change Password' },
  '/forgot': { variant: 'forgot', title: 'Reset Password' },
  '/comment': { variant: 'comment', title: 'Login to Comment' },
};

/** Leading body text before the first element, as on HN's auth-gate pages. */
function extractAuthMessage(doc: Document): string | null {
  const parts: string[] = [];

  for (const node of doc.body.childNodes) {
    if (node.nodeType === node.TEXT_NODE) {
      const text = node.textContent!.trim();
      if (text) {
        parts.push(text);
      }
    } else if (node.nodeType === node.ELEMENT_NODE && (node.nodeName !== 'BR' || parts.length > 0)) {
      break;
    }
  }

  return parts.join(' ') || null;
}

function toField(input: FieldElement, label: string): FormField {
  return { label, name: input.name, type: input.type || 'text', value: input.value };
}

function parseVisibleFields(form: HTMLFormElement): FormField[] {
  const tableFields = Array.from(form.querySelectorAll('tr'), (row) => {
    const tds = row.querySelectorAll('td');
    const input = tds[1]?.querySelector<FieldElement>(VISIBLE_FIELD_SELECTOR);
    return input ? toField(input, textOf(tds[0]).replace(/:$/, '').trim()) : null;
  }).filter(field => field !== null);

  if (tableFields.length > 0) {
    return tableFields;
  }

  // Non-table forms (like /forgot) label inputs with a preceding text node.
  return Array.from(form.querySelectorAll<FieldElement>(VISIBLE_FIELD_SELECTOR), (input) => {
    let prev = input.previousSibling;
    while (prev && !prev.textContent?.trim()) {
      prev = prev.previousSibling;
    }
    return toField(input, prev?.textContent!.trim().replace(/:$/, '') || input.name);
  });
}

export function parseLoginPage(doc: Document, path = doc.location?.pathname ?? ''): ParsedLoginPage {
  // HN serves rate-limit responses as text/plain. Browsers represent those
  // documents as <body><pre>Sorry.</pre></body>, so the usual leading-text
  // extractor cannot see the message as a direct body text node.
  const bodyText = doc.body.textContent!.trim();
  const isRateLimited = /^Sorry\.?$/i.test(bodyText);
  const authMessage = isRateLimited ? bodyText : extractAuthMessage(doc);
  const pathVariant = isRateLimited ? undefined : PATH_VARIANTS[path];
  const { variant, title } = pathVariant ?? (isRateLimited
    ? { variant: 'rate-limited' as const, title: 'Rate limited' }
    : { variant: authMessage ? 'auth-gate' as const : 'login' as const, title: authMessage ?? 'Login' });

  const forms = Array.from((doc.querySelector('table#hnmain') ?? doc.body).querySelectorAll('form'), form => ({
    // An omitted action posts back to the current URL, including its query.
    // HN uses this with from-op fields on unsuffixed action auth gates.
    action: form.getAttribute('action') ?? '',
    method: form.getAttribute('method') ?? 'post',
    visibleFields: parseVisibleFields(form),
    hiddenFields: Array.from(form.querySelectorAll<HTMLInputElement>('input[type=hidden]'), el => ({ name: el.name, value: el.value })),
    submitLabel: form.querySelector<HTMLInputElement>('input[type=submit]')?.value ?? 'login',
  }));

  return { variant, title, authMessage, forms };
}
