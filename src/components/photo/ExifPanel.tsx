import React, { useState } from 'react';
import { ExifMetadata } from '../../utils/exifParser';
import {
  Camera,
  Aperture,
  Clock,
  Gauge,
  Calendar,
  Layers,
  MapPin,
  Maximize2,
  Copy,
  Check,
  Info,
  Compass,
  Zap,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface ExifPanelProps {
  metadata: ExifMetadata | null;
  imageDimensions: { width: number; height: number };
  onNotify: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const ExifPanel: React.FC<ExifPanelProps> = ({
  metadata,
  imageDimensions,
  onNotify,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  // Exposure summary bar stats
  const aperture = metadata?.aperture || 'ƒ/2.8';
  const shutterSpeed = metadata?.shutterSpeed || '1/250s';
  const iso = metadata?.iso || 100;
  const focalLength = metadata?.focalLength || '35 mm';
  const cameraModel = metadata?.cameraModel || metadata?.cameraMake || 'Digital Camera';
  const lens = metadata?.lensModel || 'Standard Prime / Zoom Lens';
  const dateTime = metadata?.dateTimeOriginal || 'Recent Capture';

  const handleCopySummary = async () => {
    const summary = `${cameraModel} · ${lens} | ${focalLength} · ${aperture} · ${shutterSpeed} · ISO ${iso} | ${dateTime}`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      onNotify('success', 'EXIF Copied to Clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onNotify('error', 'Clipboard copy failed');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return null;
    if (bytes >= 1048576) {
      return `${(bytes / 1048576).toFixed(2)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden text-neutral-200">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800/80 bg-neutral-900/40 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Info className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-white tracking-wide uppercase font-mono">
            EXIF & Camera Metadata
          </span>
        </div>
        <button
          onClick={handleCopySummary}
          className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[10px] font-mono transition-colors"
          title="Copy shooting data to clipboard"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Exposure Triangle Hero Card */}
        <div className="p-3.5 rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900/90 to-neutral-950 shadow-inner space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
              Exposure Triangle
            </span>
            <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              SHOT SETTINGS
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Aperture */}
            <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800/80 flex flex-col items-center justify-center text-center group hover:border-neutral-700 transition-colors">
              <Aperture className="w-4 h-4 text-rose-400 mb-1" />
              <span className="text-[10px] text-neutral-500 font-mono uppercase">Aperture</span>
              <span className="text-sm font-black text-white font-mono mt-0.5">{aperture}</span>
            </div>

            {/* Shutter Speed */}
            <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800/80 flex flex-col items-center justify-center text-center group hover:border-neutral-700 transition-colors">
              <Clock className="w-4 h-4 text-sky-400 mb-1" />
              <span className="text-[10px] text-neutral-500 font-mono uppercase">Shutter</span>
              <span className="text-sm font-black text-white font-mono mt-0.5">{shutterSpeed}</span>
            </div>

            {/* ISO */}
            <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800/80 flex flex-col items-center justify-center text-center group hover:border-neutral-700 transition-colors">
              <Gauge className="w-4 h-4 text-amber-400 mb-1" />
              <span className="text-[10px] text-neutral-500 font-mono uppercase">ISO</span>
              <span className="text-sm font-black text-white font-mono mt-0.5">{iso}</span>
            </div>
          </div>

          {/* Focal Length & 35mm Equiv */}
          <div className="px-3 py-2 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-medium">Focal Length</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-white font-bold">{focalLength}</span>
              {metadata?.focalLengthIn35mm && metadata.focalLengthIn35mm !== focalLength && (
                <span className="text-[10px] font-mono text-neutral-500">
                  ({metadata.focalLengthIn35mm} equiv)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Camera & Lens Details */}
        <div className="p-3.5 rounded-2xl border border-neutral-800 bg-neutral-900/50 space-y-3">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-neutral-400" />
            <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono">
              Hardware Equipment
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-start justify-between gap-2 border-b border-neutral-800/60 pb-2">
              <span className="text-neutral-400 shrink-0">Camera Model</span>
              <span className="text-white font-semibold text-right">{cameraModel}</span>
            </div>

            {metadata?.cameraMake && (
              <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
                <span className="text-neutral-400">Manufacturer</span>
                <span className="text-neutral-200 font-medium">{metadata.cameraMake}</span>
              </div>
            )}

            <div className="flex items-start justify-between gap-2 border-b border-neutral-800/60 pb-2">
              <span className="text-neutral-400 shrink-0">Optics / Lens</span>
              <span className="text-neutral-200 font-medium text-right text-[11px] leading-snug">
                {lens}
              </span>
            </div>

            {metadata?.exposureProgram && (
              <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
                <span className="text-neutral-400">Exposure Mode</span>
                <span className="text-neutral-200 font-mono text-[11px]">
                  {metadata.exposureProgram}
                </span>
              </div>
            )}

            {metadata?.meteringMode && (
              <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
                <span className="text-neutral-400">Metering</span>
                <span className="text-neutral-200 font-mono text-[11px]">
                  {metadata.meteringMode}
                </span>
              </div>
            )}

            {metadata?.whiteBalance && (
              <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
                <span className="text-neutral-400">White Balance</span>
                <span className="text-neutral-200 font-mono text-[11px]">
                  {metadata.whiteBalance}
                </span>
              </div>
            )}

            {metadata?.flash && (
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Flash</span>
                <span className="text-neutral-200 font-mono text-[11px]">{metadata.flash}</span>
              </div>
            )}
          </div>
        </div>

        {/* Capture Date & Image Specs */}
        <div className="p-3.5 rounded-2xl border border-neutral-800 bg-neutral-900/50 space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono">
              Timestamp & File Details
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
              <span className="text-neutral-400">Date Captured</span>
              <span className="font-mono text-neutral-200 text-[11px]">{dateTime}</span>
            </div>

            <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
              <span className="text-neutral-400">Canvas Dimensions</span>
              <span className="font-mono text-neutral-200 font-semibold">
                {imageDimensions.width} × {imageDimensions.height} px
              </span>
            </div>

            {metadata?.colorSpace && (
              <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
                <span className="text-neutral-400">Color Profile</span>
                <span className="font-mono text-neutral-200 text-[11px]">
                  {metadata.colorSpace}
                </span>
              </div>
            )}

            {metadata?.fileSizeBytes && (
              <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
                <span className="text-neutral-400">File Weight</span>
                <span className="font-mono text-neutral-200 text-[11px]">
                  {formatFileSize(metadata.fileSizeBytes)}
                </span>
              </div>
            )}

            {metadata?.fileName && (
              <div className="flex items-start justify-between gap-2">
                <span className="text-neutral-400 shrink-0">Source Name</span>
                <span className="font-mono text-neutral-300 text-[11px] truncate max-w-[170px]">
                  {metadata.fileName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* GPS Geolocation if present */}
        {metadata?.gps && (
          <div className="p-3.5 rounded-2xl border border-neutral-800 bg-neutral-900/50 space-y-2.5">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono">
                Location Coordinates
              </span>
            </div>

            {metadata.gps.locationName && (
              <p className="text-xs font-medium text-white">{metadata.gps.locationName}</p>
            )}

            {metadata.gps.latitude !== undefined && metadata.gps.longitude !== undefined && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-950 border border-neutral-800/80 font-mono text-[11px] text-neutral-300">
                <span>
                  {metadata.gps.latitude.toFixed(4)}° N, {metadata.gps.longitude.toFixed(4)}° E
                </span>
                {metadata.gps.altitude && (
                  <span className="text-neutral-500">Alt {metadata.gps.altitude}m</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
