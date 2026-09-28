import React, { useState } from 'react';
import { FilterPreset, PresetFilterId } from '../../types';
import { FILTER_PRESETS } from '../../utils/filterPresets';
import { Check } from 'lucide-react';

interface FiltersPanelProps {
  activePresetId: PresetFilterId;
  onSelectPreset: (preset: FilterPreset) => void;
  previewImageUrl?: string;
}

export const FiltersPanel: React.FC<FiltersPanelProps> = ({
  activePresetId,
  onSelectPreset,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Cinematic', 'Atmospheric', 'Vintage', 'Modern'];

  const filtered =
    selectedCategory === 'All'
      ? FILTER_PRESETS
      : FILTER_PRESETS.filter((p) => p.category === selectedCategory);

  return (
    <div className="h-full flex flex-col overflow-hidden text-neutral-200">
      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1 p-2 border-b border-neutral-800/80 bg-neutral-900/40 overflow-x-auto shrink-0">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Preset List / Cards */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.map((preset) => {
          const isActive = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-3 group ${
                isActive
                  ? 'border-rose-500/50 bg-rose-500/10 shadow-sm'
                  : 'border-neutral-800/80 bg-neutral-900/30 hover:bg-neutral-800/50 hover:border-neutral-700'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold ${
                      isActive ? 'text-rose-400' : 'text-neutral-200 group-hover:text-white'
                    }`}
                  >
                    {preset.name}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {preset.category}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              {isActive && (
                <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
