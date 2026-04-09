const ANTI_FOUC_STYLE_ID = 'hn-anti-fouc';
const EXTENSION_STYLE_ID_PREFIX = 'fancy-hn-';

function isManagedStyleElement(element: Element) {
  return element.tagName === 'STYLE'
    && (element.id === ANTI_FOUC_STYLE_ID || element.id.startsWith(EXTENSION_STYLE_ID_PREFIX));
}

export function getLegacySourceAssetNodes(doc: Document = document) {
  return Array.from(doc.querySelectorAll('link[rel="stylesheet"], style, script'))
    .filter(element => !isManagedStyleElement(element));
}