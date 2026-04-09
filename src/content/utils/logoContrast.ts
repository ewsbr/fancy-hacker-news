interface RgbColor {
  r: number;
  g: number;
  b: number;
}

function expandHexChannel(channel: string): string {
  return channel.length === 1 ? `${channel}${channel}` : channel;
}

function parseHexColor(value: string): RgbColor | null {
  const match = value.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) {
    return null;
  }

  const hex = match[1];
  const normalizedHex = hex.length === 3
    ? `${expandHexChannel(hex[0])}${expandHexChannel(hex[1])}${expandHexChannel(hex[2])}`
    : hex;

  return {
    r: Number.parseInt(normalizedHex.slice(0, 2), 16),
    g: Number.parseInt(normalizedHex.slice(2, 4), 16),
    b: Number.parseInt(normalizedHex.slice(4, 6), 16),
  };
}

function parseRgbColor(value: string): RgbColor | null {
  const match = value.trim().match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*[\d.]+\s*)?\)$/i);
  if (!match) {
    return null;
  }

  const [r, g, b] = match.slice(1, 4).map(channel => Number.parseInt(channel, 10));
  if ([r, g, b].some(channel => channel < 0 || channel > 255)) {
    return null;
  }

  return { r, g, b };
}

function parseColor(value: string): RgbColor | null {
  return parseHexColor(value) ?? parseRgbColor(value);
}

function srgbToLinear(channel: number): number {
  const normalizedChannel = channel / 255;
  return normalizedChannel <= 0.04045
    ? normalizedChannel / 12.92
    : ((normalizedChannel + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(color: RgbColor): number {
  const r = srgbToLinear(color.r);
  const g = srgbToLinear(color.g);
  const b = srgbToLinear(color.b);

  return (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
}

function contrastRatio(a: number, b: number): number {
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

export function getLogoForegroundColor(backgroundColor: string): '#000000' | '#ffffff' {
  const parsedColor = parseColor(backgroundColor);
  if (!parsedColor) {
    return '#ffffff';
  }

  const backgroundLuminance = relativeLuminance(parsedColor);
  if (backgroundLuminance >= 0.7) {
    return '#000000';
  }

  const whiteContrast = contrastRatio(backgroundLuminance, 1);
  return whiteContrast >= 2 ? '#ffffff' : '#000000';
}