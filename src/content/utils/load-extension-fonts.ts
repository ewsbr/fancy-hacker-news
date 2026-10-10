import atkinsonLatinItalicUrl from '@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-italic.woff2?url';
import atkinsonLatinNormalUrl from '@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-normal.woff2?url';
import jetbrainsMonoLatinUrl from '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2?url';
import manropeLatinUrl from '@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2?url';

const FONT_STYLE_ID = 'fancy-hn-font-faces';
const LATIN_UNICODE_RANGE = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';

const FONT_FACES = [
  { family: 'Atkinson Hyperlegible Next Variable', style: 'normal', weight: '200 800', src: atkinsonLatinNormalUrl },
  { family: 'Atkinson Hyperlegible Next Variable', style: 'italic', weight: '200 800', src: atkinsonLatinItalicUrl },
  { family: 'Manrope Variable', style: 'normal', weight: '200 800', src: manropeLatinUrl },
  { family: 'JetBrains Mono Variable', style: 'normal', weight: '100 800', src: jetbrainsMonoLatinUrl },
];

export function loadExtensionFonts() {
  if (document.getElementById(FONT_STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = FONT_STYLE_ID;
  style.textContent = FONT_FACES.map(({ family, style, weight, src }) => (
    `@font-face { font-family: "${family}"; font-style: ${style}; font-display: swap; font-weight: ${weight}; src: url("${src}") format("woff2-variations"); unicode-range: ${LATIN_UNICODE_RANGE}; }`
  )).join('\n');
  document.head.appendChild(style);
}

export async function primeExtensionFonts() {
  loadExtensionFonts();
  await Promise.allSettled([
    document.fonts.load('400 14px "Atkinson Hyperlegible Next Variable"'),
    document.fonts.load('italic 400 14px "Atkinson Hyperlegible Next Variable"'),
    document.fonts.load('600 16px "Manrope Variable"'),
    document.fonts.load('400 13px "JetBrains Mono Variable"'),
  ]);
}
