import { GraphicCanvasFormat, GraphicElement } from '../types';

export const GRAPHIC_FORMATS: GraphicCanvasFormat[] = [
  { id: 'insta-square', name: 'Instagram Square', category: 'Social', width: 1080, height: 1080, aspectRatioDisplay: '1:1' },
  { id: 'insta-story', name: 'Story / Reel / TikTok', category: 'Social', width: 1080, height: 1920, aspectRatioDisplay: '9:16' },
  { id: 'yt-thumb', name: 'YouTube Thumbnail', category: 'Social', width: 1280, height: 720, aspectRatioDisplay: '16:9' },
  { id: 'twitter-banner', name: 'Twitter / X Header', category: 'Social', width: 1500, height: 500, aspectRatioDisplay: '3:1' },
  { id: 'presentation-slide', name: 'Slide Deck (16:9)', category: 'Web', width: 1920, height: 1080, aspectRatioDisplay: '16:9' },
  { id: 'poster-a4', name: 'A4 Poster', category: 'Print', width: 1240, height: 1754, aspectRatioDisplay: '1:1.41' },
];

export interface GraphicStarterTemplate {
  id: string;
  name: string;
  formatId: string;
  background: {
    type: 'color' | 'gradient';
    value: string;
  };
  elements: GraphicElement[];
}

export const STARTER_TEMPLATES: GraphicStarterTemplate[] = [
  {
    id: 'minimal-podcast',
    name: 'Minimalist Podcast Cover',
    formatId: 'insta-square',
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
    },
    elements: [
      {
        id: 'rect-accent',
        type: 'shape',
        shapeType: 'rectangle',
        x: 60,
        y: 60,
        width: 960,
        height: 960,
        rotation: 0,
        opacity: 0.15,
        borderColor: '#f43f5e',
        borderWidth: 2,
        borderRadius: 24,
      },
      {
        id: 'badge-ep',
        type: 'shape',
        shapeType: 'pill',
        x: 100,
        y: 120,
        width: 180,
        height: 44,
        rotation: 0,
        opacity: 1,
        fillColor: '#f43f5e',
        borderRadius: 999,
      },
      {
        id: 'badge-text',
        type: 'text',
        text: 'EPISODE 42',
        x: 120,
        y: 128,
        width: 140,
        height: 30,
        rotation: 0,
        opacity: 1,
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Outfit',
      },
      {
        id: 'title-1',
        type: 'text',
        text: 'THE CREATIVE\nDISPATCH',
        x: 100,
        y: 220,
        width: 880,
        height: 220,
        rotation: 0,
        opacity: 1,
        color: '#ffffff',
        fontSize: 72,
        fontWeight: 'black',
        textAlign: 'left',
        letterSpacing: -1,
        lineHeight: 1.05,
        fontFamily: 'Outfit',
      },
      {
        id: 'sub-1',
        type: 'text',
        text: 'Exploring typography, tactile interfaces & modern web aesthetics with studio designers.',
        x: 100,
        y: 490,
        width: 780,
        height: 120,
        rotation: 0,
        opacity: 0.75,
        color: '#a1a1aa',
        fontSize: 28,
        fontWeight: 'normal',
        textAlign: 'left',
        lineHeight: 1.4,
        fontFamily: 'Plus Jakarta Sans',
      },
      {
        id: 'host-text',
        type: 'text',
        text: 'HOSTED BY ALEXA VANCE & MARCUS REID',
        x: 100,
        y: 920,
        width: 800,
        height: 40,
        rotation: 0,
        opacity: 0.6,
        color: '#f43f5e',
        fontSize: 18,
        fontWeight: 'semibold',
        textAlign: 'left',
        letterSpacing: 2,
        fontFamily: 'JetBrains Mono',
      },
    ],
  },
  {
    id: 'cyber-banner',
    name: 'Cyberpunk YouTube Thumb',
    formatId: 'yt-thumb',
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)',
    },
    elements: [
      {
        id: 'glow-card',
        type: 'shape',
        shapeType: 'rectangle',
        x: 80,
        y: 70,
        width: 720,
        height: 580,
        rotation: 0,
        opacity: 0.3,
        fillColor: '#030712',
        borderColor: '#38bdf8',
        borderWidth: 2,
        borderRadius: 20,
      },
      {
        id: 'highlight-kicker',
        type: 'text',
        text: 'FULL MASTERCLASS 2026',
        x: 130,
        y: 130,
        width: 600,
        height: 40,
        rotation: 0,
        opacity: 1,
        color: '#38bdf8',
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 2,
        fontFamily: 'JetBrains Mono',
      },
      {
        id: 'bold-title',
        type: 'text',
        text: 'MODERN\nCANVAS\nMAGIC',
        x: 130,
        y: 190,
        width: 600,
        height: 320,
        rotation: 0,
        opacity: 1,
        color: '#f8fafc',
        fontSize: 84,
        fontWeight: 'black',
        letterSpacing: -2,
        lineHeight: 0.95,
        fontFamily: 'Outfit',
      },
    ],
  },
];

export const EDITORIAL_TEMPLATES = [
  {
    id: 'announcement',
    title: 'Product Launch Announcement',
    content: `# Announcing Zoro. Studio v3.0

We are thrilled to unveil the next evolution of our creative studio toolkit. Engineered from the ground up for unmatched speed, spatial precision, and intuitive creative control.

## What's New

### 1. High-Precision Color Grading
Adjust highlights, shadows, warmth, and film grain with real-time hardware acceleration. Every slider updates the viewport at silky 60fps.

- **Film Presets**: 12 handcrafted color curves inspired by vintage 35mm film stocks.
- **Vignette & Contrast**: Non-destructive micro-adjustments for deep focal depth.
- **Realtime Histogram**: Instant chromatic luminance feedback.

### 2. Multi-Layer Design Engine
Create expressive banners, editorial covers, and digital posters directly in your browser.

> "The cleanest editorial canvas we've ever deployed." — Creative Lead

### 3. Distraction-Free Prose
Switch between pure image manipulation and long-form markdown editing without switching windows.

---

### Technical Highlights
| Dimension | Specification |
| :--- | :--- |
| Canvas Renderer | WebGL & 2D Context |
| Max Export Res | 4096 × 4096 px |
| Latency | < 16ms |

Ready to inspect your projects? Open the **Photo Studio** or **Graphic Canvas** from the header navigation above.
`,
  },
  {
    id: 'creative-brief',
    title: 'Design Philosophy & Style Brief',
    content: `# Creative Studio Direction Brief

**Document Version**: 2.4  
**Focus**: Visual Balance, Color Harmony & Typographic Restraint

---

### 1. The Core Objective
Elevate creative output through disciplined layout structures. Eliminate generic digital artifacts in favor of purposeful contrast, tactile surfaces, and balanced hierarchy.

### 2. Typographic Rules
1. **Headline Discipline**: Pair bold, characterful geometric display type with high-legibility body prose.
2. **Tabular Numerals**: Render all statistics, dimensions, and timestamps using monospaced numbers.
3. **No Unintentional Wraps**: Enforce balanced line wraps on high-impact display copy.

### 3. Palette Guidelines
- **Canvas Base**: Deep obsidian (\`#0a0a0c\`) with cool graphite structural borders.
- **Accents**: High-intent crimson and amber highlights reserved strictly for interactive state.
- **Whitespace**: Provide generous breathing margins around focal media.
`,
  },
];
