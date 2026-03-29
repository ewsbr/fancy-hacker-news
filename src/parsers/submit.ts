import { attrOf } from './utils';

export interface SubmitField {
  name: string;
  value: string;
  type: string;
}

export interface ParsedSubmitPage {
  /**
   * null when the user is not logged in (the page shows a login prompt instead).
   */
  form: {
    action: string;
    fnid: string;
    fnop: string;
    fields: SubmitField[];
  } | null;
  isLoggedOut: boolean;
}

export function parseSubmitPage(doc: Document): ParsedSubmitPage {
  const form = doc.querySelector<HTMLFormElement>('form[action="/r"]');

  if (!form) {
    return { form: null, isLoggedOut: true };
  }

  const fnid = attrOf(form.querySelector('input[name="fnid"]'), 'value') || '';
  const fnop = attrOf(form.querySelector('input[name="fnop"]'), 'value') || '';

  // Collect visible user-editable fields (exclude hidden fields and submit button)
  const fields: SubmitField[] = [];
  form.querySelectorAll('input, textarea').forEach(el => {
    const type = (el.getAttribute('type') || (el.tagName === 'TEXTAREA' ? 'textarea' : 'text')).toLowerCase();
    if (type === 'hidden' || type === 'submit') return;
    const name = el.getAttribute('name');
    if (!name) return;
    fields.push({
      name,
      value: (el as HTMLInputElement | HTMLTextAreaElement).value || '',
      type,
    });
  });

  return {
    form: {
      action: attrOf(form, 'action') || '/r',
      fnid,
      fnop,
      fields,
    },
    isLoggedOut: false,
  };
}
