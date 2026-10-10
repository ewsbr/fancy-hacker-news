/** WCAG relative luminance of a `#rgb` or `#rrggbb` color, or null for other formats. */
export function getRelativeLuminance(color: string): number | null {
  const hex = color.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1];
  if (!hex) {
    return null;
  }

  const channels = hex.length === 3 ? [...hex].map(channel => channel + channel) : hex.match(/../g)!;
  const [r, g, b] = channels.map((channel) => {
    const value = Number.parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getLogoForegroundColor(backgroundColor: string): '#000000' | '#ffffff' {
  const luminance = getRelativeLuminance(backgroundColor);
  // White keeps at least 2:1 contrast up to a luminance of 0.475.
  return luminance === null || luminance <= 0.475 ? '#ffffff' : '#000000';
}
