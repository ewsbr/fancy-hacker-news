import { textOf, attrOf, hrefOf } from './shared/dom';
import { parseAge } from './shared/age';
import { extractRichTextHtml } from './shared/body';
import { isNewUser } from './shared/comment';
import { parseScore } from './shared/score';

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
  const bigbox = doc.querySelector('#bigbox table');

  // Item row
  const athing = bigbox?.querySelector('tr.athing');
  const comhead = athing?.querySelector('span.comhead');
  const authorEl = comhead?.querySelector('a.hnuser');
  const ageInfo = parseAge(comhead?.querySelector('span.age'));
  const commtext = athing?.querySelector('div.commtext');
  const scoreEl = comhead?.querySelector('span.score');

  const navs = comhead?.querySelector('span.navs');
  const navsLinks = navs ? Array.from(navs.querySelectorAll('a')) : [];
  const parentAnchor = navsLinks.find(a => textOf(a) === 'parent') ?? null;
  const contextAnchor = navsLinks.find(a => textOf(a) === 'context') ?? null;
  const onstoryAnchor = navs?.querySelector('span.onstory a') ?? null;

  const item = athing
    ? {
        id: athing.id,
        author: textOf(authorEl),
        isNewUser: isNewUser(authorEl),
        age: ageInfo.text,
        ageLink: ageInfo.link,
        score: parseScore(textOf(scoreEl)),
        bodyHtml: extractRichTextHtml(commtext),
        parentLink: hrefOf(parentAnchor),
        contextLink: hrefOf(contextAnchor),
        storyTitle: onstoryAnchor ? textOf(onstoryAnchor) : null,
        storyLink: onstoryAnchor ? hrefOf(onstoryAnchor) : null,
      }
    : null;

  // Confirm / delete form
  const form = doc.querySelector<HTMLFormElement>('form[action="/xdelete"]');
  const deleteForm = form
    ? {
        action: attrOf(form, 'action') || '/xdelete',
        id: attrOf(form.querySelector('input[name="id"]'), 'value') || '',
        gotoUrl: attrOf(form.querySelector('input[name="goto"]'), 'value') || '',
        hmac: attrOf(form.querySelector('input[name="hmac"]'), 'value') || '',
      }
    : null;

  const errorMessage =
    item === null && deleteForm === null
      ? (doc.body?.textContent?.trim() || null)
      : null;

  return { errorMessage, item, deleteForm };
}
