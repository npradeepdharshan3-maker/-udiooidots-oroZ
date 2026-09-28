export type StudioWorkspace = 'photo' | 'video' | 'audio' | 'ai' | 'graphics' | 'editorial' | 'palette';

export interface PhotoAdjustments {
  brightness: number; // -100 to 100 (default 0)
  contrast: number; // -100 to 100 (default 0)
  saturation: number; // -100 to 100 (default 0)
  exposure: number; // -100 to 100 (default 0)
  temperature: number; // -100 to 100 (default 0)
  tint: number; // -100 to 100 (default 0)
  highlights: number; // -100 to 100 (default 0)
  shadows: number; // -100 to 100 (default 0)
  sharpness: number; // 0 to 100 (default 0)
  blur: number; // 0 to 40 (default 0)
  vignette: number; // 0 to 100 (default 0)
  grain: number; // 0 to 100 (default 0)
  sepia: number; // 0 to 100 (default 0)
  invert: number; // 0 to 100 (default 0)
  hueRotate: number; // 0 to 360 (default 0)
}

export type PresetFilterId =
  | 'normal'
  | 'cinematic'
  | 'noir'
  | 'goldenHour'
  | 'vintage77'
  | 'cyberpunk'
  | 'nordic'
  | 'kodachrome'
  | 'emerald'
  | 'dramaticHdr'
  | 'pastelDream'
  | 'analogFade';

export interface FilterPreset {
  id: PresetFilterId;
  name: string;
  category: 'Cinematic' | 'Vintage' | 'Atmospheric' | 'Modern';
  description: string;
  adjustments: Partial<PhotoAdjustments>;
}

export type AspectRatioType = 'free' | '1:1' | '4:5' | '16:9' | '9:16' | '4:3' | '3:2';

export interface CropState {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio: AspectRatioType;
  isActive: boolean;
}

export interface TransformState {
  rotation: number; // -180 to 180 or 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  scale: number; // zoom level 0.2 to 5
}

export type CanvasTool = 'cursor' | 'brush' | 'highlighter' | 'eraser' | 'shape-rect' | 'shape-circle' | 'shape-arrow' | 'shape-line' | 'text';

export interface CanvasAnnotation {
  id: string;
  tool: CanvasTool;
  points?: { x: number; y: number }[]; // for brush / highlighter
  x?: number; // for shapes & text
  y?: number;
  width?: number;
  height?: number;
  endX?: number; // for lines/arrows
  endY?: number;
  color: string;
  strokeWidth: number;
  opacity: number;
  // For text annotations
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  backgroundColor?: string;
  shadow?: boolean;
  // CapCut Pro Text Effects
  textStrokeColor?: string;
  textStrokeWidth?: number;
  textGlowColor?: string;
  textGlowBlur?: number;
  textBadgeStyle?: 'pill' | 'box' | 'gradient' | 'none';
  textGradient?: string;
  letterSpacing?: number;
}

export interface HistoryEntry {
  adjustments: PhotoAdjustments;
  filterPreset: PresetFilterId;
  transform: TransformState;
  annotations: CanvasAnnotation[];
  crop?: CropState;
  timestamp: number;
  actionName: string;
}

export interface SampleImage {
  id: string;
  title: string;
  category: string;
  url: string;
  author: string;
  thumbnail: string;
}

export interface GraphicElement {
  id: string;
  type: 'text' | 'shape' | 'badge' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  // Text specifics
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  lineHeight?: number;
  color?: string;
  backgroundColor?: string;
  // Shape specifics
  shapeType?: 'rectangle' | 'circle' | 'pill' | 'star' | 'triangle' | 'line';
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  // Image specifics
  imageUrl?: string;
  aspectRatioLock?: boolean;
}

export interface GraphicCanvasFormat {
  id: string;
  name: string;
  category: 'Social' | 'Web' | 'Print';
  width: number;
  height: number;
  aspectRatioDisplay: string;
}

export interface AudioTrackItem {
  id: string;
  title: string;
  artist: string;
  genre: 'Lo-Fi' | 'Cinematic' | 'Ambient' | 'Electronic' | 'Acoustic' | 'Chillhop';
  duration: number; // in seconds
  durationFormatted: string;
  audioUrl: string;
  bpm: number;
  coverGradient: string;
  description: string;
  tags: string[];
  isSynthesized?: boolean;
}

export interface VideoFilterSettings {
  brightness: number; // 0.5 to 2 (default 1)
  contrast: number; // 0.5 to 2 (default 1)
  saturate: number; // 0 to 2 (default 1)
  hueRotate: number; // 0 to 360 (default 0)
  sepia: number; // 0 to 1 (default 0)
  invert: number; // 0 to 1 (default 0)
  blur: number; // 0 to 10px (default 0)
  grayscale: number; // 0 to 1 (default 0)
}

export interface VideoTextOverlay {
  id: string;
  text: string;
  color: string;
  fontSize: number;
  fontFamily: string;
  position: 'top' | 'center' | 'bottom';
  startTime: number;
  endTime: number;
  backgroundColor?: string;
}

