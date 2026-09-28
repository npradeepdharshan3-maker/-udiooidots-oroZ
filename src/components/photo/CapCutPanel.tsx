import React, { useState } from 'react';
import {
  CAPCUT_STICKERS,
  CAPCUT_COLOR_SETTINGS,
  CAPCUT_RATIO_PRESETS,
  CapCutSticker,
} from '../../data/capcutItems';
import {
  CAPCUT_TEXT_PRESETS,
  CapCutTextStylePreset,
} from '../../data/capcutTextStyles';
import { PhotoAdjustments, AspectRatioType, CanvasAnnotation } from '../../types';
import {
  Sparkles,
  Flame,
  Film,
  Smartphone,
  Sticker,
  Type,
  Check,
  Plus,
  Zap,
  Sliders,
  Palette,
  Volume2,
} from 'lucide-react';

interface CapCutPanelProps {
  adjustments: PhotoAdjustments;
  onApplyColorPreset: (name: string, adj: Partial<PhotoAdjustments>) => void;
  onSetAspectRatio: (ratio: AspectRatioType, name: string) => void;
  onAddStickerAnnotation: (sticker: CapCutSticker) => void;
  onAddCinematicBars: () => void;
  onAddVhsOverlay: () => void;
  onAddSubtitlesOverlay: (text: string) => void;
  onAddCapCutProText: (preset: CapCutTextStylePreset, customText: string) => void;
  onNotify: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const CapCutPanel: React.FC<CapCutPanelProps> = ({
  adjustments,
  onApplyColorPreset,
  onSetAspectRatio,
  onAddStickerAnnotation,
  onAddCinematicBars,
  onAddVhsOverlay,
  onAddSubtitlesOverlay,
  onAddCapCutProText,
  onNotify,
}) => {
  type CapCutTab = 'text' | 'grade' | 'ratios' | 'stickers' | 'fx';
  const [activeTab, setActiveTab] = useState<CapCutTab>('text');

  // CapCut Pro Text State
  const [proTextValue, setProTextValue] = useState<string>('VIRAL HOOK 🔥');
  const [selectedTextPreset, setSelectedTextPreset] = useState<CapCutTextStylePreset>(
    CAPCUT_TEXT_PRESETS[0]
  );
  const [selectedTextCategory, setSelectedTextCategory] = useState<string>('All');

  // Quick subtitle draft
  const [subtitleText, setSubtitleText] = useState<string>('WATCH UNTIL THE END 😱');
  const [selectedStickerCat, setSelectedStickerCat] = useState<string>('All');

  const textCategories = ['All', 'Viral Subtitles', 'Bold Headliners', 'Cyber & Neon', '3D & Metallic', 'Y2K Retro'];
  const filteredTextPresets =
    selectedTextCategory === 'All'
      ? CAPCUT_TEXT_PRESETS
      : CAPCUT_TEXT_PRESETS.filter((p) => p.category === selectedTextCategory);

  const stickerCategories = ['All', 'Trending', 'Vlog & Creator', 'Aesthetics', 'Badges'];
  const filteredStickers =
    selectedStickerCat === 'All'
      ? CAPCUT_STICKERS
      : CAPCUT_STICKERS.filter((s) => s.category === selectedStickerCat);

  const handleApplySelectedProText = (preset: CapCutTextStylePreset) => {
    setSelectedTextPreset(preset);
    onAddCapCutProText(preset, proTextValue);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden text-neutral-200">
      {/* Sub-header with CapCut logo vibe */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800/80 bg-neutral-900/40 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-cyan-500 via-sky-400 to-rose-500 flex items-center justify-center shadow-sm">
            <span className="text-[10px] font-black text-black font-mono tracking-tighter">CC</span>
          </div>
          <span className="text-xs font-bold text-white tracking-wide uppercase font-mono">
            CapCut Studio Suite
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-amber-400 font-mono font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
            PRO TEXT
          </span>
          <span className="text-[9px] text-cyan-400 font-mono font-semibold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
            2026
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-5 p-1.5 gap-1 border-b border-neutral-800/80 bg-neutral-950/60 shrink-0">
        <button
          onClick={() => setActiveTab('text')}
          className={`py-1.5 px-1 rounded-lg text-[10.5px] font-medium transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'text'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
          title="CapCut Pro Typography & Kinetic Text"
        >
          <Type className="w-3.5 h-3.5 text-amber-400" />
          <span>Text</span>
        </button>
        <button
          onClick={() => setActiveTab('grade')}
          className={`py-1.5 px-1 rounded-lg text-[10.5px] font-medium transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'grade'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          <span>Grading</span>
        </button>
        <button
          onClick={() => setActiveTab('ratios')}
          className={`py-1.5 px-1 rounded-lg text-[10.5px] font-medium transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'ratios'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-sky-400" />
          <span>Ratios</span>
        </button>
        <button
          onClick={() => setActiveTab('stickers')}
          className={`py-1.5 px-1 rounded-lg text-[10.5px] font-medium transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'stickers'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sticker className="w-3.5 h-3.5 text-teal-400" />
          <span>Items</span>
        </button>
        <button
          onClick={() => setActiveTab('fx')}
          className={`py-1.5 px-1 rounded-lg text-[10.5px] font-medium transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'fx'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Film className="w-3.5 h-3.5 text-emerald-400" />
          <span>FX</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 1. CapCut Pro Level Text */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            {/* Input Composer Box */}
            <div className="p-3.5 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-neutral-900 to-neutral-950 space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  CapCut Pro Text Generator
                </span>
                <span className="text-[9px] font-mono text-neutral-400">Layer Stamp</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={proTextValue}
                  onChange={(e) => setProTextValue(e.target.value)}
                  placeholder="Enter video caption, headline or hook..."
                  className="w-full px-3.5 py-2.5 bg-neutral-950/90 border border-neutral-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-bold placeholder-neutral-500 shadow-inner"
                />
              </div>

              {/* Action Button */}
              <button
                onClick={() => onAddCapCutProText(selectedTextPreset, proTextValue)}
                className="w-full py-2.5 bg-gradient-to-r from-amber-400 via-rose-500 to-cyan-500 hover:from-amber-300 hover:via-rose-400 hover:to-cyan-400 text-black font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Stamp Pro Text Layer</span>
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                  Pro Typography Styles
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {filteredTextPresets.length} presets
                </span>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                {textCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedTextCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors ${
                      selectedTextCategory === cat
                        ? 'bg-neutral-800 text-white border border-neutral-700'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2.5">
              {filteredTextPresets.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleApplySelectedProText(preset)}
                  className={`group p-3 rounded-xl border cursor-pointer transition-all space-y-2 ${
                    selectedTextPreset.id === preset.id
                      ? 'border-amber-500 bg-amber-500/10 shadow-md'
                      : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/60 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {preset.name}
                      </span>
                      <span className="ml-2 text-[9px] text-neutral-400 font-mono">
                        {preset.category}
                      </span>
                    </div>
                    <button className="px-2 py-0.5 rounded bg-neutral-800 group-hover:bg-amber-400 group-hover:text-black font-semibold text-[10px] text-neutral-300 transition-colors">
                      Use Style
                    </button>
                  </div>

                  {/* Visual Render Preview */}
                  <div
                    className="w-full py-3 px-4 rounded-lg flex items-center justify-center overflow-hidden border border-neutral-800/80"
                    style={{ backgroundColor: preset.previewBg }}
                  >
                    <span
                      style={preset.previewStyle}
                      className="text-base tracking-wide select-none truncate text-center"
                    >
                      {proTextValue.trim() || preset.previewText}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {preset.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. CapCut Color Grading */}
        {activeTab === 'grade' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                Viral Color Grades
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">1-Tap Match</span>
            </div>

            <div className="space-y-2.5">
              {CAPCUT_COLOR_SETTINGS.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onApplyColorPreset(item.name, item.adjustments)}
                  className="group p-3 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/60 hover:border-cyan-500/50 cursor-pointer transition-all space-y-1.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {item.name}
                    </span>
                    <button className="px-2 py-0.5 rounded bg-neutral-800 group-hover:bg-cyan-500 group-hover:text-black font-semibold text-[10px] text-neutral-300 transition-colors">
                      Apply
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. CapCut Aspect Ratio Formats */}
        {activeTab === 'ratios' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                Platform Frame Presets
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">TikTok & YT</span>
            </div>

            <div className="space-y-2">
              {CAPCUT_RATIO_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => onSetAspectRatio(preset.ratio as AspectRatioType, preset.name)}
                  className="p-3 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/60 hover:border-sky-500/50 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xl shrink-0 p-1.5 bg-neutral-950 rounded-lg border border-neutral-800">
                      {preset.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors">
                        {preset.name}
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-0.5 font-mono">
                        {preset.width} × {preset.height} ({preset.ratio})
                      </p>
                    </div>
                  </div>
                  <button className="px-2.5 py-1 rounded-md bg-neutral-800 group-hover:bg-sky-500 group-hover:text-black font-semibold text-[10px] text-neutral-300 transition-colors">
                    Crop
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. CapCut Stickers & Badges */}
        {activeTab === 'stickers' && (
          <div className="space-y-3">
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {stickerCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedStickerCat(cat)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap transition-colors ${
                    selectedStickerCat === cat
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {filteredStickers.map((sticker) => (
                <button
                  key={sticker.id}
                  onClick={() => onAddStickerAnnotation(sticker)}
                  className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 hover:border-rose-500/50 transition-all flex flex-col items-center justify-center gap-1.5 group text-center"
                >
                  <span className="text-2xl group-hover:scale-125 transition-transform">
                    {sticker.emoji}
                  </span>
                  <span className="text-[10px] text-neutral-300 font-medium truncate max-w-full">
                    {sticker.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 5. Overlays & Cinematic Elements */}
        {activeTab === 'fx' && (
          <div className="space-y-4">
            {/* Viral Subtitle Banner Generator */}
            <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-200 font-mono">
                  CapCut Auto-Caption Style
                </span>
                <span className="text-[10px] text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded">
                  VIRAL TEXT
                </span>
              </div>
              <input
                type="text"
                value={subtitleText}
                onChange={(e) => setSubtitleText(e.target.value)}
                placeholder="Enter caption text..."
                className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
              />
              <button
                onClick={() => onAddSubtitlesOverlay(subtitleText)}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-black font-bold text-xs rounded-lg shadow-md transition-all active:scale-95"
              >
                + Stamp TikTok Caption
              </button>
            </div>

            {/* Cinematic Black Letterbox Bars */}
            <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-200 font-mono">
                  2.35:1 Cinematic Letterbox
                </span>
                <Film className="w-3.5 h-3.5 text-neutral-400" />
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Applies cinematic black masking bars to top & bottom of image for blockbuster widescreen look.
              </p>
              <button
                onClick={onAddCinematicBars}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs rounded-lg transition-colors border border-neutral-700"
              >
                Toggle Cinematic Letterbox Bars
              </button>
            </div>

            {/* VHS Date & Timestamp */}
            <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-200 font-mono">
                  VHS Camcorder HUD
                </span>
                <span className="text-[10px] text-rose-400 font-mono font-bold">● REC</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Stamps retro video camera date, timestamp, and red recording indicator.
              </p>
              <button
                onClick={onAddVhsOverlay}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs rounded-lg transition-colors border border-neutral-700"
              >
                + Stamp VHS Camcorder HUD
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
