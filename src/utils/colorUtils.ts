export interface ExtractedColor {
  hex: string;
  rgb: [number, number, number];
  hsl: [number, number, number];
  role: string;
  isLight: boolean;
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
}

/**
 * Extracts a palette of 6 distinct colors from an image or canvas
 */
export function extractPaletteFromImage(
  imageOrCanvas: HTMLImageElement | HTMLCanvasElement
): ExtractedColor[] {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return getFallbackPalette();

    const sampleSize = 64;
    canvas.width = sampleSize;
    canvas.height = sampleSize;

    ctx.drawImage(imageOrCanvas, 0, 0, sampleSize, sampleSize);
    const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize);
    const data = imgData.data;

    // Bucket into 3D color cubes
    const colorCounts: { [key: string]: { r: number; g: number; b: number; count: number } } = {};
    const step = 4; // Sample every 4th pixel for speed
    for (let i = 0; i < data.length; i += 4 * step) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 128) continue; // Skip transparency

      // Quantize to 32-step buckets
      const qr = Math.floor(r / 32) * 32;
      const qg = Math.floor(g / 32) * 32;
      const qb = Math.floor(b / 32) * 32;
      const key = `${qr},${qg},${qb}`;

      if (!colorCounts[key]) {
        colorCounts[key] = { r, g, b, count: 0 };
      }
      colorCounts[key].count++;
    }

    const sorted = Object.values(colorCounts).sort((a, b) => b.count - a.count);
    if (sorted.length === 0) return getFallbackPalette();

    // Pick 6 distinct colors
    const picked: ExtractedColor[] = [];
    const roles = ['Dominant', 'Vibrant', 'Muted Midtone', 'Deep Accent', 'Highlight', 'Subtle Tone'];

    for (const item of sorted) {
      if (picked.length >= 6) break;
      const hex = rgbToHex(item.r, item.g, item.b);
      const hsl = rgbToHsl(item.r, item.g, item.b);

      // Check distance from already picked colors
      const isTooClose = picked.some((p) => {
        const dR = p.rgb[0] - item.r;
        const dG = p.rgb[1] - item.g;
        const dB = p.rgb[2] - item.b;
        return Math.sqrt(dR * dR + dG * dG + dB * dB) < 45;
      });

      if (!isTooClose || picked.length === 0) {
        const isLight = (0.299 * item.r + 0.587 * item.g + 0.114 * item.b) > 150;
        picked.push({
          hex,
          rgb: [item.r, item.g, item.b],
          hsl,
          role: roles[picked.length] || 'Accent',
          isLight,
        });
      }
    }

    while (picked.length < 6) {
      const fallback = getFallbackPalette()[picked.length];
      picked.push(fallback);
    }

    return picked;
  } catch {
    return getFallbackPalette();
  }
}

export function generateHarmonies(baseColor: ExtractedColor): {
  type: string;
  description: string;
  colors: string[];
}[] {
  const [h, s, l] = baseColor.hsl;

  const makeHex = (newH: number, newS = s, newL = l) => {
    const wrappedH = (newH + 360) % 360;
    const [r, g, b] = hslToRgb(wrappedH, newS, newL);
    return rgbToHex(r, g, b);
  };

  return [
    {
      type: 'Complementary',
      description: 'Opposite spectrum contrast for dynamic visual tension',
      colors: [baseColor.hex, makeHex(h + 180)],
    },
    {
      type: 'Analogous',
      description: 'Adjacent harmonious hues for natural serene balance',
      colors: [makeHex(h - 30), baseColor.hex, makeHex(h + 30)],
    },
    {
      type: 'Triadic',
      description: 'Equidistant 120-degree balanced vibrancy',
      colors: [baseColor.hex, makeHex(h + 120), makeHex(h + 240)],
    },
    {
      type: 'Monochromatic',
      description: 'Variations in lightness and saturation across a single hue',
      colors: [
        makeHex(h, Math.max(10, s - 30), Math.min(92, l + 25)),
        baseColor.hex,
        makeHex(h, Math.min(100, s + 15), Math.max(15, l - 25)),
      ],
    },
  ];
}

function getFallbackPalette(): ExtractedColor[] {
  return [
    { hex: '#f43f5e', rgb: [244, 63, 94], hsl: [350, 89, 60], role: 'Dominant Crimson', isLight: false },
    { hex: '#0f172a', rgb: [15, 23, 42], hsl: [222, 47, 11], role: 'Deep Slate', isLight: false },
    { hex: '#38bdf8', rgb: [56, 189, 248], hsl: [198, 93, 60], role: 'Vibrant Cyan', isLight: true },
    { hex: '#fbbf24', rgb: [251, 191, 36], hsl: [43, 96, 56], role: 'Warm Amber', isLight: true },
    { hex: '#10b981', rgb: [16, 185, 129], hsl: [160, 84, 39], role: 'Emerald Green', isLight: false },
    { hex: '#f8fafc', rgb: [248, 250, 252], hsl: [210, 40, 98], role: 'Pure Off-White', isLight: true },
  ];
}
