import React from 'react';
import { CanvasAnnotation, CanvasTool } from '../../types';
import {
  MousePointer,
  Paintbrush,
  Highlighter,
  Square,
  Circle,
  ArrowUpRight,
  Minus,
  Type,
  Trash2,
} from 'lucide-react';

interface AnnotationPanelProps {
  currentTool: CanvasTool;
  onToolChange: (tool: CanvasTool) => void;
  currentColor: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (w: number) => void;
  opacity: number;
  onOpacityChange: (o: number) => void;
  annotationsCount: number;
  onClearAnnotations: () => void;
  textConfig: {
    text: string;
    fontSize: number;
    fontFamily: string;
    hasBackground: boolean;
  };
  onTextConfigChange: (cfg: {
    text: string;
    fontSize: number;
    fontFamily: string;
    hasBackground: boolean;
  }) => void;
  onAddTextToCenter: () => void;
}

export const AnnotationPanel: React.FC<AnnotationPanelProps> = ({
  currentTool,
  onToolChange,
  currentColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  opacity,
  onOpacityChange,
  annotationsCount,
  onClearAnnotations,
  textConfig,
  onTextConfigChange,
  onAddTextToCenter,
}) => {
  const tools: { id: CanvasTool; label: string; icon: React.ReactNode }[] = [
    { id: 'cursor', label: 'Pointer / Select', icon: <MousePointer className="w-4 h-4" /> },
    { id: 'brush', label: 'Pen Brush', icon: <Paintbrush className="w-4 h-4" /> },
    { id: 'highlighter', label: 'Highlighter', icon: <Highlighter className="w-4 h-4" /> },
    { id: 'shape-rect', label: 'Rectangle', icon: <Square className="w-4 h-4" /> },
    { id: 'shape-circle', label: 'Circle', icon: <Circle className="w-4 h-4" /> },
    { id: 'shape-arrow', label: 'Arrow', icon: <ArrowUpRight className="w-4 h-4" /> },
    { id: 'shape-line', label: 'Line', icon: <Minus className="w-4 h-4" /> },
    { id: 'text', label: 'Text Overlay', icon: <Type className="w-4 h-4" /> },
  ];

  const paletteSwatches = [
    '#ffffff',
    '#f43f5e',
    '#38bdf8',
    '#fbbf24',
    '#10b981',
    '#a855f7',
    '#000000',
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden text-neutral-200">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800/80 bg-neutral-900/40 shrink-0">
        <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
          Markings & Overlays
        </span>
        {annotationsCount > 0 && (
          <button
            onClick={onClearAnnotations}
            className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear ({annotationsCount})</span>
          </button>
        )}
      </div>

      <div className="p-4 space-y-6 overflow-y-auto flex-1">
        {/* Tool selector */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-neutral-400">Tool Selection</span>
          <div className="grid grid-cols-4 gap-2">
            {tools.map((t) => {
              const isActive = currentTool === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onToolChange(t.id)}
                  className={`p-2.5 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition-colors ${
                    isActive
                      ? 'bg-rose-500/10 border-rose-500 text-rose-400 font-medium'
                      : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                  }`}
                  title={t.label}
                >
                  {t.icon}
                  <span className="text-[10px] truncate max-w-full">{t.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color swatches */}
        <div className="space-y-2 pt-3 border-t border-neutral-800/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Stroke Color</span>
            <span className="font-mono text-neutral-400 text-[11px] uppercase">{currentColor}</span>
          </div>
          <div className="flex items-center gap-2">
            {paletteSwatches.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                style={{ backgroundColor: color }}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  currentColor.toLowerCase() === color.toLowerCase()
                    ? 'border-white scale-110 shadow-md'
                    : 'border-neutral-700 hover:scale-105'
                }`}
                title={color}
              />
            ))}
            <input
              type="color"
              value={currentColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 ml-1"
              title="Pick custom color"
            />
          </div>
        </div>

        {/* Stroke width & Opacity */}
        <div className="space-y-3.5 pt-3 border-t border-neutral-800/60">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Stroke Width</span>
              <span className="font-mono text-neutral-300 text-[11px]">{strokeWidth}px</span>
            </div>
            <input
              type="range"
              min={1}
              max={40}
              value={strokeWidth}
              onChange={(e) => onStrokeWidthChange(parseInt(e.target.value))}
              className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Opacity</span>
              <span className="font-mono text-neutral-300 text-[11px]">
                {Math.round(opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>
        </div>

        {/* Text configuration when text tool selected */}
        {currentTool === 'text' && (
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3 pt-3">
            <span className="text-xs font-semibold text-neutral-300 font-mono">
              Text Overlay Properties
            </span>
            <input
              type="text"
              value={textConfig.text}
              onChange={(e) => onTextConfigChange({ ...textConfig, text: e.target.value })}
              placeholder="Enter text overlay..."
              className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
            />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Font Size</span>
                <span className="font-mono text-neutral-300 text-[11px]">
                  {textConfig.fontSize}px
                </span>
              </div>
              <input
                type="range"
                min={16}
                max={96}
                value={textConfig.fontSize}
                onChange={(e) =>
                  onTextConfigChange({ ...textConfig, fontSize: parseInt(e.target.value) })
                }
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={textConfig.hasBackground}
                  onChange={(e) =>
                    onTextConfigChange({ ...textConfig, hasBackground: e.target.checked })
                  }
                  className="rounded border-neutral-700 text-rose-500 focus:ring-0"
                />
                <span>Dark Background Badge</span>
              </label>
            </div>
            <button
              onClick={onAddTextToCenter}
              className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors mt-2"
            >
              Stamp Text to Canvas Center
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
