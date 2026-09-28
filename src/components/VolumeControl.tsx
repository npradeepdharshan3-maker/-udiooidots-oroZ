import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Volume1, Sliders } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface VolumeControlProps {
  className?: string;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(soundEffects.getVolume());
  const [isMuted, setIsMuted] = useState<boolean>(soundEffects.getIsMuted());
  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync state on mount
  useEffect(() => {
    setVolumeState(soundEffects.getVolume());
    setIsMuted(soundEffects.getIsMuted());
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMuted = soundEffects.toggleMute();
    setIsMuted(newMuted);
    setVolumeState(soundEffects.getVolume());
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    soundEffects.setVolume(val);
    setVolumeState(val);
    setIsMuted(soundEffects.getIsMuted());
  };

  const getIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX className="w-3.5 h-3.5 text-neutral-400" />;
    }
    if (volume < 0.5) {
      return <Volume1 className="w-3.5 h-3.5 text-neutral-300" />;
    }
    return <Volume2 className="w-3.5 h-3.5 text-emerald-400" />;
  };

  return (
    <div className={`relative ${className}`} ref={popoverRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
          isOpen
            ? 'bg-neutral-800 text-white border-neutral-700 shadow-sm'
            : isMuted || volume === 0
            ? 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border-neutral-800'
            : 'bg-neutral-900 text-neutral-200 hover:text-white border-neutral-800'
        }`}
        title={`Studio Audio: ${isMuted || volume === 0 ? 'Muted' : `${Math.round(volume * 100)}%`} (Click to adjust)`}
      >
        {getIcon()}
        <span className="hidden sm:inline font-mono text-[11px]">
          {isMuted || volume === 0 ? 'Mute' : `${Math.round(volume * 100)}%`}
        </span>
      </button>

      {/* Popover Slider */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 p-3 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider font-mono">
              Studio Audio & Feedback
            </span>
            <button
              onClick={handleToggleMute}
              className={`p-1 rounded text-xs transition-colors ${
                isMuted
                  ? 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="space-y-2">
            {/* Slider */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-500 font-mono">0</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="flex-1 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <span className="text-[10px] text-neutral-500 font-mono">100</span>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80 text-[10px] font-mono">
              <button
                onClick={() => {
                  soundEffects.setVolume(0);
                  setVolumeState(0);
                  setIsMuted(true);
                }}
                className="px-2 py-0.5 rounded bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              >
                Mute
              </button>
              <button
                onClick={() => {
                  soundEffects.setVolume(0.3);
                  setVolumeState(0.3);
                  setIsMuted(false);
                  soundEffects.playTick();
                }}
                className="px-2 py-0.5 rounded bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              >
                30%
              </button>
              <button
                onClick={() => {
                  soundEffects.setVolume(0.7);
                  setVolumeState(0.7);
                  setIsMuted(false);
                  soundEffects.playTick();
                }}
                className="px-2 py-0.5 rounded bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              >
                70%
              </button>
              <button
                onClick={() => {
                  soundEffects.setVolume(1.0);
                  setVolumeState(1.0);
                  setIsMuted(false);
                  soundEffects.playShutter();
                }}
                className="px-2 py-0.5 rounded bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              >
                100%
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
