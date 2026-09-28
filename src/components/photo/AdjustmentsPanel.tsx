import React, { useState } from 'react';
import { PhotoAdjustments } from '../../types';
import {
  RotateCcw,
  Sun,
  Palette,
  Sparkles,
  Contrast,
  Sliders,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
} from 'lucide-react';

interface AdjustmentsPanelProps {
  adjustments: PhotoAdjustments;
  onChange: (adjustments: PhotoAdjustments) => void;
  onReset: () => void;
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  onResetToZero: () => void;
  colorAccent?: string;
}

const SliderRow: React.FC<SliderRowProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  onResetToZero,
  colorAccent = 'accent-rose-500',
}) => {
  const handleDecrement = () => {
    onChange(Math.max(min, value - step * (max - min > 100 ? 5 : 1)));
  };

  const handleIncrement = () => {
    onChange(Math.min(max, value + step * (max - min > 100 ? 5 : 1)));
  };

  return (
    <div className="space-y-1.5 p-2 sm:p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/60 hover:border-neutral-700 transition-colors">
      <div className="flex items-center justify-between text-xs">
        <span
          className="text-neutral-300 font-medium select-none text-[11px] sm:text-xs"
          onDoubleClick={onResetToZero}
          title="Double-tap to reset"
        >
          {label}
        </span>
        <button
          onClick={onResetToZero}
          className={`font-mono text-[11px] px-2 py-0.5 rounded transition-colors touch-manipulation ${
            value !== 0
              ? 'text-rose-400 bg-rose-500/15 font-bold border border-rose-500/20'
              : 'text-neutral-500 hover:text-neutral-300 bg-neutral-900'
          }`}
          title="Tap to reset to 0"
        >
          {value > 0 ? `+${value}` : value}
          {unit}
        </button>
      </div>

      {/* Mobile-friendly thumb & stepper buttons */}
      <div className="flex items-center gap-2 pt-0.5">
        <button
          onClick={handleDecrement}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 active:bg-neutral-800 active:scale-95 transition-all text-xs shrink-0 select-none touch-manipulation"
          title="Decrease"
        >
          <Minus className="w-3 h-3" />
        </button>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={`w-full h-2.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer ${colorAccent} touch-none`}
        />

        <button
          onClick={handleIncrement}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 active:bg-neutral-800 active:scale-95 transition-all text-xs shrink-0 select-none touch-manipulation"
          title="Increase"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export const AdjustmentsPanel: React.FC<AdjustmentsPanelProps> = ({
  adjustments,
  onChange,
  onReset,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'light' | 'color' | 'effects'>('all');

  const update = (key: keyof PhotoAdjustments, val: number) => {
    onChange({
      ...adjustments,
      [key]: val,
    });
  };

  const isModified = Object.values(adjustments).some((v) => v !== 0);

  return (
    <div className="h-full flex flex-col overflow-hidden text-neutral-200">
      {/* Panel Sub-header with Reset */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-neutral-800/80 bg-neutral-900/60 shrink-0">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-rose-500" />
          <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Adjust
          </span>
        </div>
        {isModified && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 active:scale-95 text-[11px] font-semibold transition-all touch-manipulation"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Mobile Category Quick Filter Tabs */}
      <div className="flex items-center gap-1 p-2 border-b border-neutral-800/80 bg-neutral-950/70 overflow-x-auto no-scrollbar shrink-0">
        {[
          { id: 'all', label: 'All Controls', icon: <Sliders className="w-3 h-3" /> },
          { id: 'light', label: 'Light', icon: <Sun className="w-3 h-3 text-amber-400" /> },
          { id: 'color', label: 'Color', icon: <Palette className="w-3 h-3 text-sky-400" /> },
          { id: 'effects', label: 'FX & Grain', icon: <Sparkles className="w-3 h-3 text-rose-400" /> },
        ].map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all touch-manipulation ${
                isActive
                  ? 'bg-rose-600 text-white font-semibold shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800/80'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile-optimized Natural Order adjustments list */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4">
        {/* SECTION 1: ESSENTIAL LIGHTING (Most frequently used on mobile) */}
        {(activeCategory === 'all' || activeCategory === 'light') && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-200 pt-1">
              <div className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light & Exposure</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">Tone</span>
            </div>

            <div className="space-y-2">
              <SliderRow
                label="Exposure"
                value={adjustments.exposure}
                min={-100}
                max={100}
                colorAccent="accent-amber-500"
                onChange={(v) => update('exposure', v)}
                onResetToZero={() => update('exposure', 0)}
              />
              <SliderRow
                label="Brightness"
                value={adjustments.brightness}
                min={-100}
                max={100}
                colorAccent="accent-amber-400"
                onChange={(v) => update('brightness', v)}
                onResetToZero={() => update('brightness', 0)}
              />
              <SliderRow
                label="Contrast"
                value={adjustments.contrast}
                min={-100}
                max={100}
                colorAccent="accent-rose-500"
                onChange={(v) => update('contrast', v)}
                onResetToZero={() => update('contrast', 0)}
              />
              <SliderRow
                label="Highlights"
                value={adjustments.highlights}
                min={-100}
                max={100}
                colorAccent="accent-sky-400"
                onChange={(v) => update('highlights', v)}
                onResetToZero={() => update('highlights', 0)}
              />
              <SliderRow
                label="Shadows"
                value={adjustments.shadows}
                min={-100}
                max={100}
                colorAccent="accent-indigo-400"
                onChange={(v) => update('shadows', v)}
                onResetToZero={() => update('shadows', 0)}
              />
            </div>
          </div>
        )}

        {/* SECTION 2: COLOR & WHITE BALANCE */}
        {(activeCategory === 'all' || activeCategory === 'color') && (
          <div className="space-y-2.5 pt-2 border-t border-neutral-800/60">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-200">
              <div className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-sky-400" />
                <span>Color & White Balance</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">Grading</span>
            </div>

            <div className="space-y-2">
              <SliderRow
                label="Warmth / Temperature"
                value={adjustments.temperature}
                min={-100}
                max={100}
                colorAccent="accent-orange-500"
                onChange={(v) => update('temperature', v)}
                onResetToZero={() => update('temperature', 0)}
              />
              <SliderRow
                label="Saturation / Vibrance"
                value={adjustments.saturation}
                min={-100}
                max={100}
                colorAccent="accent-rose-500"
                onChange={(v) => update('saturation', v)}
                onResetToZero={() => update('saturation', 0)}
              />
              <SliderRow
                label="Tint (Green / Magenta)"
                value={adjustments.tint}
                min={-100}
                max={100}
                colorAccent="accent-emerald-400"
                onChange={(v) => update('tint', v)}
                onResetToZero={() => update('tint', 0)}
              />
              <SliderRow
                label="Hue Shift"
                value={adjustments.hueRotate}
                min={0}
                max={360}
                unit="°"
                colorAccent="accent-purple-400"
                onChange={(v) => update('hueRotate', v)}
                onResetToZero={() => update('hueRotate', 0)}
              />
            </div>
          </div>
        )}

        {/* SECTION 3: FINISHING EFFECTS & VIGNETTE */}
        {(activeCategory === 'all' || activeCategory === 'effects') && (
          <div className="space-y-2.5 pt-2 border-t border-neutral-800/60">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-200">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>Finishing & Atmosphere</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">Effects</span>
            </div>

            <div className="space-y-2">
              <SliderRow
                label="Vignette"
                value={adjustments.vignette}
                min={0}
                max={100}
                unit="%"
                colorAccent="accent-neutral-400"
                onChange={(v) => update('vignette', v)}
                onResetToZero={() => update('vignette', 0)}
              />
              <SliderRow
                label="Film Grain"
                value={adjustments.grain}
                min={0}
                max={100}
                unit="%"
                colorAccent="accent-amber-400"
                onChange={(v) => update('grain', v)}
                onResetToZero={() => update('grain', 0)}
              />
              <SliderRow
                label="Sepia Nostalgia"
                value={adjustments.sepia}
                min={0}
                max={100}
                unit="%"
                colorAccent="accent-amber-600"
                onChange={(v) => update('sepia', v)}
                onResetToZero={() => update('sepia', 0)}
              />
              <SliderRow
                label="Soft Blur Focus"
                value={adjustments.blur}
                min={0}
                max={25}
                unit="px"
                colorAccent="accent-sky-400"
                onChange={(v) => update('blur', v)}
                onResetToZero={() => update('blur', 0)}
              />
              <SliderRow
                label="Invert Colors"
                value={adjustments.invert}
                min={0}
                max={100}
                unit="%"
                colorAccent="accent-rose-400"
                onChange={(v) => update('invert', v)}
                onResetToZero={() => update('invert', 0)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
