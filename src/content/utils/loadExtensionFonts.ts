import atkinsonLatinNormalUrl from '@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-normal.woff2?url';
import atkinsonLatinItalicUrl from '@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-italic.woff2?url';
import manropeLatinUrl from '@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2?url';
import jetbrainsMonoLatinUrl from '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2?url';

interface ExtensionFontFace {
  family: string;
  style: 'normal' | 'italic';
  weight: string;
  src: string;
  unicodeRange: string;
}

const FONT_STYLE_ID = 'fancy-hn-font-faces';
const ENGLISH_UNICODE_RANGE = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';

const fontFaces: ExtensionFontFace[] = [
  {
    family: 'Atkinson Hyperlegible Next Variable',
    style: 'normal',
    weight: '200 800',
    src: atkinsonLatinNormalUrl,
    unicodeRange: ENGLISH_UNICODE_RANGE,
  },
  {
    family: 'Atkinson Hyperlegible Next Variable',
    style: 'italic',
    weight: '200 800',
    src: atkinsonLatinItalicUrl,
    unicodeRange: ENGLISH_UNICODE_RANGE,
  },
  {
    family: 'Manrope Variable',
    style: 'normal',
    weight: '200 800',
    src: manropeLatinUrl,
    unicodeRange: ENGLISH_UNICODE_RANGE,
  },
  {
    family: 'JetBrains Mono Variable',
    style: 'normal',
    weight: '100 800',
    src: jetbrainsMonoLatinUrl,
    unicodeRange: ENGLISH_UNICODE_RANGE,
  },
];

function buildFontFaceCss() {
  return fontFaces.map(fontFace => {
    return `@font-face { font-family: "${fontFace.family}"; font-style: ${fontFace.style}; font-display: swap; font-weight: ${fontFace.weight}; src: url("${fontFace.src}") format("woff2-variations"); unicode-range: ${fontFace.unicodeRange}; }`;
  }).join('\n');
}

export function loadExtensionFonts() {
  if (document.getElementById(FONT_STYLE_ID)) {
    return;
  }

  const cssText = buildFontFaceCss();
  if (!cssText) {
    return;
  }

  const style = document.createElement('style');
  style.id = FONT_STYLE_ID;
  style.textContent = cssText;
  document.head.appendChild(style);
}

export async function primeExtensionFonts() {
  loadExtensionFonts();

  if (!document.fonts?.load) {
    return;
  }

  await Promise.allSettled([
    document.fonts.load('400 14px "Atkinson Hyperlegible Next Variable"'),
    document.fonts.load('italic 400 14px "Atkinson Hyperlegible Next Variable"'),
    document.fonts.load('600 16px "Manrope Variable"'),
    document.fonts.load('400 13px "JetBrains Mono Variable"'),
  ]);
}