/**
 * Parse HN login / changepw / forgot / comment auth pages.
 */
import { textOf } from './shared/dom';

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

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

function extractAuthMessage(doc: Document): string | null {
  const body = doc.body;
  if (!body) {
    return null;
  }

  const parts: string[] = [];

  for (const node of Array.from(body.childNodes)) {
    if (node.nodeType === TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        parts.push(text);
      }
      continue;
    }

    if (node.nodeType !== ELEMENT_NODE) {
      continue;
    }

    const element = node as Element;
    if (element.tagName === 'BR') {
      if (parts.length > 0) {
        break;
      }
      continue;
    }

    break;
  }

  return parts.length > 0 ? parts.join(' ') : null;
}

export function parseLoginPage(doc: Document): ParsedLoginPage {
  const path = location.pathname;
  const authMessage = extractAuthMessage(doc);

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
    const tableRows = form.querySelectorAll('tr');
    
    if (tableRows.length > 0) {
      for (const row of tableRows) {
        const tds = row.querySelectorAll('td');
        if (tds.length < 2) continue;
        const input = tds[1].querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input:not([type=hidden]):not([type=submit]), select, textarea');
        if (!input) continue;
        visibleFields.push({
          label: textOf(tds[0]).replace(/:$/, '').trim(),
          name: (input as HTMLInputElement).name,
          type: (input as HTMLInputElement).type || 'text',
          value: (input as HTMLInputElement).value,
        });
      }
    }

    if (visibleFields.length === 0) {
      // Fallback for non-table forms (like /forgot)
      const inputs = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input:not([type=hidden]):not([type=submit]), select, textarea');
      for (const input of inputs) {
        let label = '';
        // Try to find a previous text node as label
        let prev = input.previousSibling;
        while (prev) {
          const text = (prev.textContent || '').trim();
          if (text) {
            label = text.replace(/:$/, '');
            break;
          }
          prev = prev.previousSibling;
        }
        visibleFields.push({
          label: label || (input as HTMLInputElement).name,
          name: (input as HTMLInputElement).name,
          type: (input as HTMLInputElement).type || 'text',
          value: (input as HTMLInputElement).value,
        });
      }
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
