import React from 'react';
import { X, Command, Undo2, Redo2, ZoomIn, ZoomOut, RotateCw, Download, Crop, Type, Paintbrush } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Cmd/Ctrl + Z', label: 'Undo adjustment', icon: <Undo2 className="w-3.5 h-3.5" /> },
    { key: 'Cmd/Ctrl + Shift + Z', label: 'Redo adjustment', icon: <Redo2 className="w-3.5 h-3.5" /> },
    { key: 'Cmd/Ctrl + S', label: 'Quick Export Image', icon: <Download className="w-3.5 h-3.5" /> },
    { key: 'Space (Hold)', label: 'Hold to Compare with Original', icon: <Command className="w-3.5 h-3.5" /> },
    { key: '\\ (Backslash)', label: 'Toggle Before/After Original', icon: <Command className="w-3.5 h-3.5" /> },
    { key: 'C', label: 'Toggle Crop Tool', icon: <Crop className="w-3.5 h-3.5" /> },
    { key: 'B', label: 'Brush / Draw Tool', icon: <Paintbrush className="w-3.5 h-3.5" /> },
    { key: 'T', label: 'Add Text Overlay', icon: <Type className="w-3.5 h-3.5" /> },
    { key: 'R', label: 'Rotate 90° Clockwise', icon: <RotateCw className="w-3.5 h-3.5" /> },
    { key: '+ / -', label: 'Zoom In / Out', icon: <ZoomIn className="w-3.5 h-3.5" /> },
    { key: '0', label: 'Reset View / Fit to Screen', icon: <ZoomOut className="w-3.5 h-3.5" /> },
    { key: 'F', label: 'Toggle FPS Performance Monitor', icon: <Command className="w-3.5 h-3.5" /> },
    { key: 'I', label: 'Inspect Image EXIF Metadata', icon: <Command className="w-3.5 h-3.5" /> },
    { key: 'M', label: 'Mute / Unmute Studio Feedback Audio', icon: <Command className="w-3.5 h-3.5" /> },
    { key: 'Space', label: 'Play / Pause Video or Audio Stream', icon: <Command className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden text-neutral-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800/80">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-rose-500" />
            <h3 className="font-semibold text-sm">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-2">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-neutral-800/50 transition-colors text-xs"
            >
              <div className="flex items-center gap-2.5 text-neutral-300">
                <span className="text-neutral-500">{sc.icon}</span>
                <span>{sc.label}</span>
              </div>
              <kbd className="px-2 py-1 bg-neutral-950 border border-neutral-800 rounded font-mono text-[11px] text-neutral-400">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-5 py-3.5 bg-neutral-950/60 border-t border-neutral-800/60 flex justify-between items-center text-xs text-neutral-500">
          <span>Press ESC anytime to dismiss</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-md font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
