import React, { useState, useEffect } from 'react';
import { ExtractedColor, extractPaletteFromImage, generateHarmonies } from '../../utils/colorUtils';
import { Copy, Check, Palette, Sparkles, Download, Layers } from 'lucide-react';

interface PaletteLabProps {
  activeImage: HTMLImageElement | null;
  onNotify: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const PaletteLab: React.FC<PaletteLabProps> = ({ activeImage, onNotify }) => {
  const [palette, setPalette] = useState<ExtractedColor[]>([]);
  const [selectedColor, setSelectedColor] = useState<ExtractedColor | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  useEffect(() => {
    if (activeImage) {
      const colors = extractPaletteFromImage(activeImage);
      setPalette(colors);
      if (colors.length > 0) {
        setSelectedColor(colors[0]);
      }
    }
  }, [activeImage]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHex(text);
    onNotify('success', `Copied ${label}`, text);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const copyCssVars = () => {
    const css = palette
      .map((c, i) => `  --color-${c.role.toLowerCase().replace(/\s+/g, '-')}: ${c.hex};`)
      .join('\n');
    const fullCss = `:root {\n${css}\n}`;
    copyToClipboard(fullCss, 'CSS Variables');
  };

  const copyJson = () => {
    const json = JSON.stringify(palette, null, 2);
    copyToClipboard(json, 'Palette JSON');
  };

  const harmonies = selectedColor ? generateHarmonies(selectedColor) : [];

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-950 p-6 md:p-10 text-neutral-100">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Lab Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-rose-500" />
              <h2 className="text-xl font-bold font-display text-white tracking-tight">
                Color Lab & Palette Extractor
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Chromatic spectrum analysis derived dynamically from active image luminance & saturation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyCssVars}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-xs font-medium text-neutral-300 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-neutral-400" />
              <span>Copy CSS Vars</span>
            </button>
            <button
              onClick={copyJson}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-xs font-medium text-neutral-300 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-neutral-400" />
              <span>Copy JSON</span>
            </button>
          </div>
        </div>

        {/* Primary Extracted Palette Swatches */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
              Extracted Spectrum (6 Swatches)
            </span>
            <span className="text-xs text-neutral-500">Click a card to inspect harmonies</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {palette.map((color) => {
              const isSelected = selectedColor?.hex === color.hex;
              const isCopied = copiedHex === color.hex;

              return (
                <div
                  key={color.hex}
                  onClick={() => setSelectedColor(color)}
                  className={`group rounded-xl overflow-hidden border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-lg'
                      : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                  }`}
                >
                  {/* Swatch color tile */}
                  <div
                    style={{ backgroundColor: color.hex }}
                    className="h-28 w-full relative flex items-end p-2 transition-transform group-hover:scale-102"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(color.hex, 'HEX');
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-opacity ml-auto"
                      title="Copy HEX"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Swatch data */}
                  <div className="p-3 bg-neutral-900/80 space-y-1">
                    <span className="text-[10px] text-neutral-400 font-mono block truncate">
                      {color.role}
                    </span>
                    <div className="font-mono text-xs font-bold text-white tracking-wider">
                      {color.hex}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      rgb({color.rgb.join(', ')})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Color Harmonies */}
        {selectedColor && (
          <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div
                  style={{ backgroundColor: selectedColor.hex }}
                  className="w-8 h-8 rounded-lg shadow-md border border-neutral-700"
                />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Harmonies for {selectedColor.role} ({selectedColor.hex})
                  </h3>
                  <p className="text-xs text-neutral-400">
                    HSL: {selectedColor.hsl[0]}°, {selectedColor.hsl[1]}%, {selectedColor.hsl[2]}%
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {harmonies.map((harmony) => (
                <div
                  key={harmony.type}
                  className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/60 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-200">{harmony.type}</span>
                    <span className="text-[11px] text-neutral-500">{harmony.description}</span>
                  </div>

                  <div className="flex h-12 rounded-lg overflow-hidden border border-neutral-800">
                    {harmony.colors.map((hex, idx) => (
                      <div
                        key={idx}
                        style={{ backgroundColor: hex }}
                        onClick={() => copyToClipboard(hex, 'HEX')}
                        className="flex-1 h-full cursor-pointer flex items-center justify-center group relative hover:opacity-90 transition-opacity"
                        title={`Click to copy ${hex}`}
                      >
                        <span className="opacity-0 group-hover:opacity-100 text-[10px] font-mono font-bold bg-black/70 px-1.5 py-0.5 rounded text-white shadow">
                          {hex}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
