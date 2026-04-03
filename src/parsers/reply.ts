import { textOf, attrOf, normalizeQuotedHtml, parseAge } from './utils';

export interface ParsedReplyPage {
  isLoggedOut: boolean;
  parent: {
    author: string;
    age: string;
    bodyHtml: string;
  } | null;
  replyForm: {
    action: string;
    hmac: string;
    parentId: string;
    gotoUrl: string;
  } | null;
}

export function parseReplyPage(doc: Document): ParsedReplyPage {
  const fatitem = doc.querySelector('table.fatitem');

  if (!fatitem) {
    return { isLoggedOut: true, parent: null, replyForm: null };
  }

  // Parent comment
  const parentTr = fatitem?.querySelector('tr.athing');
  const comhead = parentTr?.querySelector('span.comhead');
  const authorEl = comhead?.querySelector('a.hnuser');
  const ageInfo = parseAge(comhead?.querySelector('span.age'));
  const commtext = parentTr?.querySelector('div.commtext');

  const parent = {
    author: textOf(authorEl),
    age: ageInfo.text,
    bodyHtml: normalizeQuotedHtml(commtext?.innerHTML || ''),
  };

  // Reply form
  const form = fatitem?.querySelector<HTMLFormElement>('form[action="comment"]');
  const replyForm = {
    action: attrOf(form, 'action') || 'comment',
    hmac: attrOf(form?.querySelector('input[name="hmac"]'), 'value') || '',
    parentId: attrOf(form?.querySelector('input[name="parent"]'), 'value') || '',
    gotoUrl: attrOf(form?.querySelector('input[name="goto"]'), 'value') || '',
  };

  return { isLoggedOut: false, parent, replyForm };
}
