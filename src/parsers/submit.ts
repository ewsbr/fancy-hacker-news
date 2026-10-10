import { attrOf } from './shared/dom';

export interface SubmitField {
  name: string;
  value: string;
  type: string;
}

export interface ParsedSubmitPage {
  form: {
    action: string;
    fnid: string;
    fnop: string;
    fields: SubmitField[];
    bookmarkletHref: string | null;
  };
  warningMessage: string | null;
}

/** Text HN renders before the form, such as validation errors on /x. */
function extractWarningMessage(form: HTMLFormElement): string | null {
  const container = form.closest('#bigbox > td') ?? form.parentElement!;
  const parts: string[] = [];
  for (const node of container.childNodes) {
    if (node === form) {
      break;
    }

    const text = node.textContent?.replace(/\s+/g, ' ').trim();
    if (text) {
      parts.push(text);
    }
  }

  return parts.join(' ') || null;
}

/** Returns null when HN shows a login prompt instead of the submit form. */
export function parseSubmitPage(doc: Document): ParsedSubmitPage | null {
  const form = doc.querySelector<HTMLFormElement>('form[action="/r"]');
  if (!form) {
    return null;
  }

  // Visible user-editable fields, excluding hidden fields and the submit button.
  const fields = Array.from(form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[name], textarea[name]'))
    .map(el => ({ name: el.name, value: el.value, type: el.type.toLowerCase() }))
    .filter(field => field.type !== 'hidden' && field.type !== 'submit');

  return {
    form: {
      action: '/r',
      fnid: attrOf(form.querySelector('input[name="fnid"]'), 'value') || '',
      fnop: attrOf(form.querySelector('input[name="fnop"]'), 'value') || '',
      fields,
      bookmarkletHref: attrOf(form.querySelector('a[href]'), 'href') || null,
    },
    warningMessage: extractWarningMessage(form),
  };
}
