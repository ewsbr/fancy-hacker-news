import { parseAge } from './shared/age';
import { extractRichTextHtml } from './shared/body';
import { attrOf, hrefOf, textOf } from './shared/dom';
import { parseScore } from './shared/score';
import { findUserLink, isNewUser } from './shared/user-link';

export interface ParsedDeleteConfirmPage {
  errorMessage: string | null;
  item: {
    id: string;
    author: string;
    isNewUser: boolean;
    age: string;
    ageLink: string;
    score: number | null;
    bodyHtml: string;
    parentLink: string | null;
    contextLink: string | null;
    storyTitle: string | null;
    storyLink: string | null;
  } | null;
  deleteForm: {
    action: string;
    id: string;
    gotoUrl: string;
    hmac: string;
  } | null;
}

export function parseDeleteConfirmPage(doc: Document): ParsedDeleteConfirmPage {
  const athing = doc.querySelector('#bigbox table tr.athing');
  const comhead = athing?.querySelector('span.comhead');
  const authorEl = findUserLink(comhead);
  const age = parseAge(comhead?.querySelector('span.age'));
  const navs = comhead?.querySelector('span.navs');
  const navLink = (label: string) => hrefOf(Array.from(navs?.querySelectorAll('a') ?? []).find(a => textOf(a) === label));
  const onstoryAnchor = navs?.querySelector('span.onstory a');

  const item = athing
    ? {
        id: athing.id,
        author: textOf(authorEl),
        isNewUser: isNewUser(authorEl),
        age: age.text,
        ageLink: age.link,
        score: parseScore(textOf(comhead?.querySelector('span.score'))),
        bodyHtml: extractRichTextHtml(athing.querySelector('div.commtext')),
        parentLink: navLink('parent'),
        contextLink: navLink('context'),
        storyTitle: onstoryAnchor ? textOf(onstoryAnchor) : null,
        storyLink: hrefOf(onstoryAnchor),
      }
    : null;

  const form = doc.querySelector('form[action="/xdelete"]');
  const inputValue = (name: string) => attrOf(form?.querySelector(`input[name="${name}"]`), 'value') || '';
  const deleteForm = form && { action: '/xdelete', id: inputValue('id'), gotoUrl: inputValue('goto'), hmac: inputValue('hmac') };

  return {
    // Some delete-confirm responses are a bare error message without the item or form.
    errorMessage: !item && !deleteForm ? doc.body.textContent!.trim() || null : null,
    item,
    deleteForm,
  };
}
