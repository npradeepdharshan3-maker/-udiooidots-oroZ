export interface CapCutSticker {
  id: string;
  name: string;
  category: 'Trending' | 'Vlog & Creator' | 'Aesthetics' | 'Badges';
  emoji: string;
  label?: string;
  color?: string;
}

export interface CapCutOverlay {
  id: string;
  name: string;
  category: 'Cinematic' | 'Retro' | 'Light Leak' | 'Glitch';
  blendMode: GlobalCompositeOperation;
  opacity: number;
  previewGradient: string;
  applyOverlay: (ctx: CanvasRenderingContext2D, width: number, height: number, intensity: number) => void;
}

export const CAPCUT_STICKERS: CapCutSticker[] = [
  { id: 'fire', name: 'Fire / Lit', category: 'Trending', emoji: '🔥' },
  { id: 'sparkles', name: 'Sparkles', category: 'Aesthetics', emoji: '✨' },
  { id: 'heart-glitch', name: 'Neon Heart', category: 'Aesthetics', emoji: '💖' },
  { id: 'sub-badge', name: 'SUBSCRIBE', category: 'Vlog & Creator', emoji: '🔔', label: 'SUBSCRIBE', color: '#ef4444' },
  { id: 'rec-badge', name: 'REC 00:00:24', category: 'Vlog & Creator', emoji: '🔴', label: '● REC', color: '#f43f5e' },
  { id: 'like-badge', name: 'LIKE & SHARE', category: 'Vlog & Creator', emoji: '👍', label: '100K LIKES', color: '#3b82f6' },
  { id: 'butterfly', name: 'Y2K Butterfly', category: 'Aesthetics', emoji: '🦋' },
  { id: 'lightning', name: 'Cyber Lightning', category: 'Trending', emoji: '⚡' },
  { id: 'verified', name: 'Verified Badge', category: 'Badges', emoji: '✓', label: 'VERIFIED CREATOR', color: '#0ea5e9' },
  { id: 'new-drop', name: 'NEW DROP', category: 'Badges', emoji: '🚨', label: 'NEW DROP 2026', color: '#f59e0b' },
  { id: 'crown', name: 'VIP Crown', category: 'Badges', emoji: '👑' },
  { id: 'skull', name: 'Phonk Skull', category: 'Trending', emoji: '💀' },
  { id: 'camera', name: 'Vintage 35mm', category: 'Vlog & Creator', emoji: '📸' },
  { id: 'star-burst', name: 'Retro Star', category: 'Aesthetics', emoji: '⭐' },
  { id: 'money', name: 'Hustle Bag', category: 'Trending', emoji: '💸' },
  { id: 'music-wave', name: 'Audio Beat', category: 'Trending', emoji: '🎵', label: 'NOW PLAYING', color: '#a855f7' },
];

export const CAPCUT_RATIO_PRESETS = [
  { id: '9:16', name: 'TikTok / Shorts / Reels', ratio: '9:16', icon: '📱', width: 1080, height: 1920, desc: '9:16 Full Screen Vertical' },
  { id: '16:9', name: 'YouTube / Widescreen', ratio: '16:9', icon: '💻', width: 1920, height: 1080, desc: '16:9 Cinematic Landscape' },
  { id: '1:1', name: 'Square Feed', ratio: '1:1', icon: '⏹', width: 1080, height: 1080, desc: '1:1 Instagram Post' },
  { id: '4:5', name: 'Portrait Feed', ratio: '4:5', icon: '🖼', width: 1080, height: 1350, desc: '4:5 High-engagement Portrait' },
  { id: '2.35:1', name: 'Anamorphic Cinema', ratio: 'free', icon: '🎬', width: 1920, height: 817, desc: 'Cinematic Letterbox Bar' },
];

export const CAPCUT_COLOR_SETTINGS = [
  {
    id: 'tokyo-drift',
    name: 'Phonk / Tokyo Drift',
    desc: 'Deep crushed blacks, electric cyan & magenta neon accents',
    adjustments: {
      contrast: 38,
      saturation: 32,
      brightness: -8,
      highlights: 14,
      shadows: -22,
      tint: 28,
      temperature: -16,
      vignette: 45,
      grain: 18,
    },
  },
  {
    id: 'velocity-glow',
    name: 'Velocity Glow Edit',
    desc: 'Super punchy viral highlights, lifted vibrance & soft dream bloom',
    adjustments: {
      exposure: 18,
      brightness: 12,
      contrast: 26,
      saturation: 28,
      highlights: 30,
      shadows: 14,
      temperature: 8,
      blur: 2,
    },
  },
  {
    id: 'y2k-film',
    name: 'Y2K Retro Camcorder',
    desc: 'Lo-fi VHS color bleed, warm nostalgia & heavy film grain',
    adjustments: {
      contrast: -12,
      brightness: 6,
      saturation: -14,
      temperature: 24,
      sepia: 22,
      grain: 48,
      vignette: 28,
    },
  },
  {
    id: 'dark-aesthetic',
    name: 'Moody Dark Aesthetic',
    desc: 'Subdued desaturated cinema tone popular in POV edits',
    adjustments: {
      brightness: -14,
      contrast: 24,
      saturation: -38,
      shadows: 20,
      highlights: -18,
      vignette: 50,
      temperature: -12,
    },
  },
  {
    id: 'sun-drenched',
    name: 'Golden Hour Vlog',
    desc: 'Radiant warm skin tones with glowing amber light roll-off',
    adjustments: {
      temperature: 42,
      tint: 12,
      brightness: 10,
      contrast: 8,
      saturation: 22,
      highlights: -10,
      shadows: 16,
      vignette: 15,
    },
  },
];
