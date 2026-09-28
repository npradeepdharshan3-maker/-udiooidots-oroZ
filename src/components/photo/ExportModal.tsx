import React, { useState } from 'react';
import { X, Download, Copy, Check, FileDown, Layers, Cloud, RefreshCw } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseWidth: number;
  baseHeight: number;
  onExport: (format: 'png' | 'jpeg' | 'webp', quality: number, scale: number, filename: string) => Promise<void>;
  onCopyToClipboard: (format: 'png') => Promise<boolean>;
  onSaveToDrive?: (format: 'png' | 'jpeg' | 'webp', quality: number, scale: number, filename: string) => Promise<void>;
  isGoogleAuthenticated?: boolean;
  onGoogleSignIn?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  baseWidth,
  baseHeight,
  onExport,
  onCopyToClipboard,
  onSaveToDrive,
  isGoogleAuthenticated = false,
  onGoogleSignIn,
}) => {
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [quality, setQuality] = useState<number>(92);
  const [scale, setScale] = useState<number>(1);
  const [filename, setFilename] = useState<string>('zoro-studio-export');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isSavingToDrive, setIsSavingToDrive] = useState<boolean>(false);
  const [savedToDrive, setSavedToDrive] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const finalWidth = Math.round(baseWidth * scale);
  const finalHeight = Math.round(baseHeight * scale);

  // Approximate size estimation
  const totalPixels = finalWidth * finalHeight;
  let estimatedKb = Math.round((totalPixels * 3) / 1024);
  if (format === 'png') estimatedKb = Math.round(estimatedKb * 0.7);
  else if (format === 'jpeg') estimatedKb = Math.round(estimatedKb * (quality / 100) * 0.35);
  else if (format === 'webp') estimatedKb = Math.round(estimatedKb * (quality / 100) * 0.25);

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      soundEffects.playShutter();
      await onExport(format, quality / 100, scale, filename || 'edited-image');
      onClose();
    } finally {
      setIsExporting(false);
    }
  };

  const handleDriveSave = async () => {
    if (!isGoogleAuthenticated && onGoogleSignIn) {
      onGoogleSignIn();
      return;
    }
    if (!onSaveToDrive) return;

    try {
      setIsSavingToDrive(true);
      soundEffects.playShutter();
      await onSaveToDrive(format, quality / 100, scale, filename || 'edited-image');
      setSavedToDrive(true);
      soundEffects.playSuccess();
      setTimeout(() => setSavedToDrive(false), 3000);
    } finally {
      setIsSavingToDrive(false);
    }
  };

  const handleCopy = async () => {
    try {
      const ok = await onCopyToClipboard('png');
      if (ok) {
        soundEffects.playSuccess();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // handled in parent
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden text-neutral-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <FileDown className="w-4 h-4 text-rose-500" />
            <h3 className="font-semibold text-sm">Export Composition</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Filename */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">File Name</label>
            <div className="flex items-center rounded-lg bg-neutral-950 border border-neutral-800 focus-within:border-rose-500 overflow-hidden">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="w-full px-3 py-2 bg-transparent text-xs text-white focus:outline-none"
                placeholder="image-export"
              />
              <span className="pr-3 text-xs font-mono text-neutral-500">.{format}</span>
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">File Format</label>
            <div className="grid grid-cols-3 gap-2">
              {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                    format === fmt
                      ? 'border-rose-500 bg-rose-500/10 text-rose-400 font-semibold'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <span className="uppercase">{fmt}</span>
                  <span className="block text-[10px] text-neutral-500 font-normal">
                    {fmt === 'png' ? 'Lossless' : fmt === 'jpeg' ? 'Compressed' : 'Modern Web'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Scale / Resolution Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Resolution Scale</span>
              <span className="font-mono text-neutral-300">
                {finalWidth} × {finalHeight} px
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { s: 1, label: '1x Native' },
                { s: 1.5, label: '1.5x HD' },
                { s: 2, label: '2x Ultra' },
              ].map((item) => (
                <button
                  key={item.s}
                  onClick={() => setScale(item.s)}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-medium transition-colors ${
                    scale === item.s
                      ? 'border-rose-500 bg-rose-500/10 text-rose-400'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider (for JPEG / WebP) */}
          {format !== 'png' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Compression Quality</span>
                <span className="font-mono text-neutral-300">{quality}%</span>
              </div>
              <input
                type="range"
                min={40}
                max={100}
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>
          )}

          {/* Dimension & Size Summary */}
          <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-xl flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-neutral-500" />
              <span>Est. File Size:</span>
            </div>
            <span className="font-mono text-neutral-200 font-medium">
              ~{estimatedKb > 1024 ? `${(estimatedKb / 1024).toFixed(1)} MB` : `${estimatedKb} KB`}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-5 py-4 bg-neutral-950 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={isExporting || isSavingToDrive}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              title="Copy high-res image directly to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            {/* Save directly to Google Drive */}
            {onSaveToDrive && (
              <button
                onClick={handleDriveSave}
                disabled={isExporting || isSavingToDrive}
                className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                title="Save this export directly to Google Drive"
              >
                {isSavingToDrive ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : savedToDrive ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-sky-400" />
                    <span>Save to Drive</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={isExporting || isSavingToDrive}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-rose-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Generating...' : 'Download'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
