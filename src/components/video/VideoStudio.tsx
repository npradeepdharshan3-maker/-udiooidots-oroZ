import React, { useState, useRef, useEffect } from 'react';
import { SAMPLE_VIDEOS } from '../../data/videoSamples';
import { VideoFilterSettings, VideoTextOverlay } from '../../types';
import { soundEffects } from '../../utils/soundEffects';
import {
  Play,
  Pause,
  RotateCcw,
  Scissors,
  Download,
  Upload,
  Film,
  Sparkles,
  Type,
  Sliders,
  Volume2,
  VolumeX,
  FastForward,
  Rewind,
  Check,
  Video,
  Layers,
  Trash2,
  Maximize2,
  Minimize2,
  Split,
  Eye,
  Camera,
  RefreshCw,
} from 'lucide-react';

interface VideoStudioProps {
  onNotify: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

const DEFAULT_FILTERS: VideoFilterSettings = {
  brightness: 1,
  contrast: 1,
  saturate: 1,
  hueRotate: 0,
  sepia: 0,
  invert: 0,
  blur: 0,
  grayscale: 0,
};

export const VideoStudio: React.FC<VideoStudioProps> = ({ onNotify }) => {
  const [activeVideoUrl, setActiveVideoUrl] = useState<string>(SAMPLE_VIDEOS[0].videoUrl);
  const [videoTitle, setVideoTitle] = useState<string>(SAMPLE_VIDEOS[0].title);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(10);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'filters' | 'trim' | 'text' | 'library'>('filters');

  // Video Filters
  const [filters, setFilters] = useState<VideoFilterSettings>(DEFAULT_FILTERS);
  const [activePreset, setActivePreset] = useState<string>('normal');

  // Video Trim Range (in seconds)
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(10);

  // Text Overlays
  const [textOverlays, setTextOverlays] = useState<VideoTextOverlay[]>([]);
  const [newText, setNewText] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [textPosition, setTextPosition] = useState<'top' | 'center' | 'bottom'>('bottom');

  // Export / Render state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Compute CSS filter string for video preview
  const filterStyle = `
    brightness(${filters.brightness})
    contrast(${filters.contrast})
    saturate(${filters.saturate})
    hue-rotate(${filters.hueRotate}deg)
    sepia(${filters.sepia})
    invert(${filters.invert})
    blur(${filters.blur}px)
    grayscale(${filters.grayscale})
  `;

  // Filter Presets
  const applyPreset = (presetName: string) => {
    soundEffects.playTick();
    setActivePreset(presetName);
    switch (presetName) {
      case 'cinematic':
        setFilters({ ...DEFAULT_FILTERS, contrast: 1.25, saturate: 1.15, brightness: 0.95 });
        break;
      case 'vintage':
        setFilters({ ...DEFAULT_FILTERS, sepia: 0.5, contrast: 1.1, brightness: 1.05 });
        break;
      case 'noir':
        setFilters({ ...DEFAULT_FILTERS, grayscale: 1, contrast: 1.4, brightness: 0.9 });
        break;
      case 'cyberpunk':
        setFilters({ ...DEFAULT_FILTERS, hueRotate: 280, saturate: 1.5, contrast: 1.2 });
        break;
      case 'vivid':
        setFilters({ ...DEFAULT_FILTERS, saturate: 1.6, contrast: 1.1, brightness: 1.05 });
        break;
      default:
        setFilters(DEFAULT_FILTERS);
        break;
    }
  };

  // Play / Pause Toggle
  const togglePlay = () => {
    soundEffects.playTick();
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      // If at end or beyond trim range, loop back to trimStart
      if (video.currentTime >= trimEnd || video.currentTime < trimStart) {
        video.currentTime = trimStart;
      }
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  // Handle trim loop constraints
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    setCurrentTime(video.currentTime);

    // Keep playback inside trimmed window
    if (trimEnd > trimStart && video.currentTime >= trimEnd) {
      video.currentTime = trimStart;
      if (!isPlaying) {
        video.pause();
      }
    }
  };

  // User video upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundEffects.playStamp();
    const url = URL.createObjectURL(file);
    setActiveVideoUrl(url);
    setVideoTitle(file.name.replace(/\.[^/.]+$/, ''));
    setIsPlaying(false);
    setTrimStart(0);
    setFilters(DEFAULT_FILTERS);
    setActivePreset('normal');
    setTextOverlays([]);

    onNotify('success', 'Video Imported', `Loaded "${file.name}" into Video Studio.`);
    e.target.value = '';
  };

  // Load sample video
  const handleLoadSample = (sample: typeof SAMPLE_VIDEOS[0]) => {
    soundEffects.playStamp();
    setActiveVideoUrl(sample.videoUrl);
    setVideoTitle(sample.title);
    setIsPlaying(false);
    setTrimStart(0);
    setTrimEnd(sample.duration);
    setFilters(DEFAULT_FILTERS);
    setActivePreset('normal');
    setTextOverlays([]);
    onNotify('info', 'Loaded Sample Video', sample.title);
  };

  // Add text overlay
  const handleAddTextOverlay = () => {
    if (!newText.trim()) return;
    soundEffects.playStamp();

    const overlay: VideoTextOverlay = {
      id: `text-${Date.now()}`,
      text: newText.trim(),
      color: textColor,
      fontSize: 24,
      fontFamily: 'sans-serif',
      position: textPosition,
      startTime: trimStart,
      endTime: trimEnd,
      backgroundColor: 'rgba(0,0,0,0.5)',
    };

    setTextOverlays((prev) => [...prev, overlay]);
    setNewText('');
    onNotify('success', 'Text Overlay Added', `Added subtitle "${overlay.text}"`);
  };

  // Capture Frame Snapshot as PNG
  const handleCaptureSnapshot = () => {
    const video = videoRef.current;
    if (!video) return;

    soundEffects.playShutter();
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply filters to snapshot
    ctx.filter = filterStyle;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw active text overlays
    textOverlays.forEach((ov) => {
      if (video.currentTime >= ov.startTime && video.currentTime <= ov.endTime) {
        ctx.font = `bold ${Math.round(canvas.width * 0.035)}px sans-serif`;
        ctx.textAlign = 'center';
        let yPos = canvas.height * 0.88;
        if (ov.position === 'top') yPos = canvas.height * 0.12;
        if (ov.position === 'center') yPos = canvas.height * 0.5;

        ctx.fillStyle = ov.color;
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 8;
        ctx.fillText(ov.text, canvas.width / 2, yPos);
      }
    });

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${videoTitle}-frame-${Math.round(video.currentTime)}s.png`;
    a.click();

    onNotify('success', 'Frame Snapshot Captured', `Saved high-res PNG frame at ${formatTime(video.currentTime)}.`);
  };

  // Export Edited Video via Canvas & MediaRecorder
  const handleExportVideo = async () => {
    const video = videoRef.current;
    if (!video) return;

    soundEffects.playStamp();
    setIsExporting(true);
    setExportProgress(0);

    try {
      const canvas = document.createElement('canvas');
      const w = video.videoWidth || 1280;
      const h = video.videoHeight || 720;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Setup stream and recorder
      const stream = canvas.captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${videoTitle}-edited.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        soundEffects.playSuccess();
        setIsExporting(false);
        onNotify('success', 'Video Exported Successfully', `${videoTitle}-edited.webm is ready!`);
      };

      recorder.start();

      // Seek video to trimStart
      video.pause();
      video.currentTime = trimStart;
      setIsPlaying(false);

      const totalRenderDuration = Math.max(1, trimEnd - trimStart);
      const frameRate = 30;
      const intervalMs = 1000 / frameRate;

      // Play video to capture frames
      await video.play();

      const renderInterval = setInterval(() => {
        if (!video || video.ended || video.currentTime >= trimEnd) {
          clearInterval(renderInterval);
          video.pause();
          recorder.stop();
          return;
        }

        const elapsed = video.currentTime - trimStart;
        const progress = Math.min(100, Math.round((elapsed / totalRenderDuration) * 100));
        setExportProgress(progress);

        // Draw video frame with active CSS filters applied
        ctx.filter = filterStyle;
        ctx.drawImage(video, 0, 0, w, h);

        // Render text overlays
        textOverlays.forEach((ov) => {
          if (video.currentTime >= ov.startTime && video.currentTime <= ov.endTime) {
            ctx.save();
            ctx.filter = 'none';
            ctx.font = `bold ${Math.round(w * 0.04)}px sans-serif`;
            ctx.textAlign = 'center';
            let yPos = h * 0.88;
            if (ov.position === 'top') yPos = h * 0.12;
            if (ov.position === 'center') yPos = h * 0.5;

            // Background pill
            const textMetrics = ctx.measureText(ov.text);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.beginPath();
            ctx.roundRect(
              w / 2 - textMetrics.width / 2 - 16,
              yPos - Math.round(w * 0.035),
              textMetrics.width + 32,
              Math.round(w * 0.05),
              8
            );
            ctx.fill();

            // Text
            ctx.fillStyle = ov.color;
            ctx.fillText(ov.text, w / 2, yPos);
            ctx.restore();
          }
        });
      }, intervalMs);
    } catch (err) {
      console.error(err);
      setIsExporting(false);
      onNotify('error', 'Export Failed', 'Unable to capture video render stream.');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-950 text-neutral-100 select-none">
      {/* Top Header Video Info & Export Bar */}
      <div className="h-12 border-b border-neutral-800/80 bg-neutral-950/70 px-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-bold text-white tracking-wide uppercase">Video Studio</span>
          </div>
          <span className="text-neutral-600">·</span>
          <span className="text-xs text-neutral-300 font-medium truncate max-w-[200px] sm:max-w-md">
            {videoTitle}
          </span>
          <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-400">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,.mp4,.webm,.mov,.m4v"
            onChange={handleVideoUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Import video file from computer or phone"
          >
            <Upload className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Import Video</span>
          </button>

          <button
            onClick={handleCaptureSnapshot}
            className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Capture current video frame as high-res PNG image"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Snapshot</span>
          </button>

          <button
            onClick={handleExportVideo}
            disabled={isExporting}
            className="px-3.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting ({exportProgress}%)</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export Video</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Center Layout: Video Viewport & Editing Panels */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Main Video Stage */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-neutral-950/90 relative overflow-hidden">
          {/* Video Container with Overlays */}
          <div className="relative max-h-[58vh] max-w-[92%] aspect-video rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 bg-black flex items-center justify-center group">
            <video
              ref={videoRef}
              src={activeVideoUrl}
              crossOrigin="anonymous"
              playsInline
              style={{ filter: filterStyle }}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  const d = videoRef.current.duration || 10;
                  setDuration(d);
                  setTrimEnd(d);
                }
              }}
              onEnded={() => setIsPlaying(false)}
              className="w-full h-full object-contain"
            />

            {/* Active Text Overlays Rendered Over Video */}
            {textOverlays.map((ov) => {
              const isVisible = currentTime >= ov.startTime && currentTime <= ov.endTime;
              if (!isVisible) return null;

              let posClass = 'bottom-6';
              if (ov.position === 'top') posClass = 'top-6';
              if (ov.position === 'center') posClass = 'top-1/2 -translate-y-1/2';

              return (
                <div
                  key={ov.id}
                  className={`absolute ${posClass} left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-center shadow-lg pointer-events-none transition-all`}
                  style={{ color: ov.color }}
                >
                  <span className="font-bold text-sm md:text-base drop-shadow-md tracking-wide">
                    {ov.text}
                  </span>
                </div>
              );
            })}

            {/* Center Play Button Overlay on Hover */}
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white shadow-2xl flex items-center justify-center backdrop-blur-sm transition-transform active:scale-90 opacity-0 group-hover:opacity-100"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
            </button>
          </div>

          {/* Quick Floating Playback Toolbar */}
          <div className="mt-3 flex items-center gap-3 px-4 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 shadow-xl text-xs">
            <button
              onClick={() => {
                soundEffects.playTick();
                if (videoRef.current) videoRef.current.currentTime = Math.max(trimStart, currentTime - 5);
              }}
              className="text-neutral-400 hover:text-white"
              title="Back 5s"
            >
              <Rewind className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-600/30"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
            </button>

            <button
              onClick={() => {
                soundEffects.playTick();
                if (videoRef.current) videoRef.current.currentTime = Math.min(trimEnd, currentTime + 5);
              }}
              className="text-neutral-400 hover:text-white"
              title="Forward 5s"
            >
              <FastForward className="w-4 h-4" />
            </button>

            <div className="h-3 w-px bg-neutral-800 mx-1" />

            {/* Volume */}
            <button
              onClick={() => {
                const nextMute = !isMuted;
                setIsMuted(nextMute);
                if (videoRef.current) videoRef.current.muted = nextMute;
              }}
              className="text-neutral-400 hover:text-white"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const val = Number(e.target.value);
                setVolume(val);
                setIsMuted(false);
                if (videoRef.current) {
                  videoRef.current.volume = val;
                  videoRef.current.muted = false;
                }
              }}
              className="w-16 accent-rose-500 cursor-pointer h-1 rounded bg-neutral-800"
            />

            <div className="h-3 w-px bg-neutral-800 mx-1" />

            {/* Playback speed */}
            <div className="flex items-center gap-1 font-mono text-[11px]">
              {[0.5, 1, 1.5, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    soundEffects.playTick();
                    setPlaybackSpeed(s);
                    if (videoRef.current) videoRef.current.playbackRate = s;
                  }}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    playbackSpeed === s
                      ? 'bg-rose-500/20 text-rose-300 font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Video Adjustments & Subtitles Studio */}
        <aside className="w-full md:w-80 lg:w-96 border-l border-neutral-800/80 bg-neutral-950 flex flex-col shrink-0">
          {/* Tab Selection */}
          <div className="flex border-b border-neutral-800 bg-neutral-950/60 px-2 pt-2 gap-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('filters')}
              className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'filters'
                  ? 'border-rose-500 text-rose-400 font-semibold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Color & Filters</span>
            </button>
            <button
              onClick={() => setActiveTab('trim')}
              className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'trim'
                  ? 'border-rose-500 text-rose-400 font-semibold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Trim / Cut</span>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'text'
                  ? 'border-rose-500 text-rose-400 font-semibold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Text Overlay</span>
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'library'
                  ? 'border-rose-500 text-rose-400 font-semibold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Samples</span>
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* TAB: FILTERS & COLOR GRADING */}
            {activeTab === 'filters' && (
              <div className="space-y-4">
                {/* Presets Grid */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                    Color Grade Presets
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {['normal', 'cinematic', 'vintage', 'noir', 'cyberpunk', 'vivid'].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => applyPreset(preset)}
                        className={`py-1.5 px-2 rounded-lg text-xs capitalize transition-all border ${
                          activePreset === preset
                            ? 'bg-rose-600 text-white font-semibold border-rose-500 shadow'
                            : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sliders */}
                <div className="space-y-3.5 pt-2">
                  {/* Brightness */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-neutral-300">
                      <span>Brightness</span>
                      <span className="font-mono text-neutral-400">{Math.round(filters.brightness * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.8"
                      step="0.05"
                      value={filters.brightness}
                      onChange={(e) => setFilters((f) => ({ ...f, brightness: Number(e.target.value) }))}
                      className="w-full accent-rose-500"
                    />
                  </div>

                  {/* Contrast */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-neutral-300">
                      <span>Contrast</span>
                      <span className="font-mono text-neutral-400">{Math.round(filters.contrast * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.05"
                      value={filters.contrast}
                      onChange={(e) => setFilters((f) => ({ ...f, contrast: Number(e.target.value) }))}
                      className="w-full accent-rose-500"
                    />
                  </div>

                  {/* Saturation */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-neutral-300">
                      <span>Saturation</span>
                      <span className="font-mono text-neutral-400">{Math.round(filters.saturate * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2.5"
                      step="0.05"
                      value={filters.saturate}
                      onChange={(e) => setFilters((f) => ({ ...f, saturate: Number(e.target.value) }))}
                      className="w-full accent-rose-500"
                    />
                  </div>

                  {/* Hue Rotate */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-neutral-300">
                      <span>Hue Tone</span>
                      <span className="font-mono text-neutral-400">{filters.hueRotate}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="5"
                      value={filters.hueRotate}
                      onChange={(e) => setFilters((f) => ({ ...f, hueRotate: Number(e.target.value) }))}
                      className="w-full accent-rose-500"
                    />
                  </div>

                  {/* Sepia */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-neutral-300">
                      <span>Sepia / Warmth</span>
                      <span className="font-mono text-neutral-400">{Math.round(filters.sepia * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={filters.sepia}
                      onChange={(e) => setFilters((f) => ({ ...f, sepia: Number(e.target.value) }))}
                      className="w-full accent-rose-500"
                    />
                  </div>

                  {/* Blur */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-neutral-300">
                      <span>Soft Blur</span>
                      <span className="font-mono text-neutral-400">{filters.blur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="8"
                      step="0.5"
                      value={filters.blur}
                      onChange={(e) => setFilters((f) => ({ ...f, blur: Number(e.target.value) }))}
                      className="w-full accent-rose-500"
                    />
                  </div>

                  {/* Reset Filters */}
                  <button
                    onClick={() => {
                      soundEffects.playTick();
                      setFilters(DEFAULT_FILTERS);
                      setActivePreset('normal');
                    }}
                    className="w-full py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Adjustments</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB: TRIM / TIMELINE CUT */}
            {activeTab === 'trim' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                    <Scissors className="w-4 h-4" />
                    <span>Trim Duration Window</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Set start and end points to extract or loop a specific highlight clip.
                  </p>
                </div>

                {/* Start Trim Time */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-neutral-300">
                    <span>Clip Start Point</span>
                    <span className="font-mono text-emerald-400">{formatTime(trimStart)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(0, trimEnd - 0.5)}
                    step="0.1"
                    value={trimStart}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setTrimStart(val);
                      if (videoRef.current) videoRef.current.currentTime = val;
                    }}
                    className="w-full accent-emerald-500"
                  />
                </div>

                {/* End Trim Time */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-neutral-300">
                    <span>Clip End Point</span>
                    <span className="font-mono text-rose-400">{formatTime(trimEnd)}</span>
                  </div>
                  <input
                    type="range"
                    min={trimStart + 0.5}
                    max={duration || 10}
                    step="0.1"
                    value={trimEnd}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setTrimEnd(val);
                    }}
                    className="w-full accent-rose-500"
                  />
                </div>

                <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">Total Trimmed Duration:</span>
                  <span className="text-white font-bold">
                    {(trimEnd - trimStart).toFixed(1)}s
                  </span>
                </div>
              </div>
            )}

            {/* TAB: TEXT OVERLAYS & CAPTIONS */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-neutral-300">Add Title or Subtitle</span>
                  <input
                    type="text"
                    placeholder="Enter text (e.g. Cinematic Intro)..."
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Position & Color */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 space-y-1">
                    <span className="text-[11px] text-neutral-400">Placement</span>
                    <div className="flex rounded-lg bg-neutral-900 border border-neutral-800 p-0.5 text-xs">
                      {(['top', 'center', 'bottom'] as const).map((pos) => (
                        <button
                          key={pos}
                          onClick={() => setTextPosition(pos)}
                          className={`flex-1 py-1 capitalize rounded transition-colors ${
                            textPosition === pos ? 'bg-rose-600 text-white font-semibold' : 'text-neutral-400'
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-neutral-400">Color</span>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-10 h-8 rounded border border-neutral-700 bg-neutral-900 cursor-pointer block"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddTextOverlay}
                  className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-semibold text-xs shadow-md shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>Insert Text Layer</span>
                </button>

                {/* Overlays List */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider font-mono">
                    Active Text Layers ({textOverlays.length})
                  </span>
                  {textOverlays.map((ov) => (
                    <div
                      key={ov.id}
                      className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="truncate flex-1">
                        <span className="font-semibold text-white truncate block">{ov.text}</span>
                        <span className="text-[10px] text-neutral-500 capitalize">{ov.position} overlay</span>
                      </div>
                      <button
                        onClick={() => setTextOverlays((prev) => prev.filter((o) => o.id !== ov.id))}
                        className="p-1 rounded text-neutral-400 hover:text-rose-400 transition-colors"
                        title="Delete layer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: SAMPLES LIBRARY */}
            {activeTab === 'library' && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                  Sample High-Definition Video Clips
                </span>
                {SAMPLE_VIDEOS.map((sample) => (
                  <div
                    key={sample.id}
                    onClick={() => handleLoadSample(sample)}
                    className="group rounded-xl overflow-hidden border border-neutral-800 hover:border-rose-500/50 cursor-pointer transition-all shadow-md relative bg-neutral-900"
                  >
                    <img
                      src={sample.thumbnail}
                      alt={sample.title}
                      className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2.5 flex flex-col justify-end">
                      <span className="text-xs font-semibold text-white">{sample.title}</span>
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-0.5">
                        <span>{sample.author}</span>
                        <span className="font-mono text-emerald-400">{sample.duration}s</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Bottom Timeline Scrubber Track */}
      <div className="h-14 border-t border-neutral-800/80 bg-neutral-950/95 px-4 flex items-center gap-4 z-10 shrink-0">
        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/30"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
        </button>

        {/* Video Scrubber Slider */}
        <div className="flex-1 flex flex-col justify-center space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
            <span className="text-emerald-400">{formatTime(currentTime)}</span>
            <span className="text-neutral-500">Trim Window: {formatTime(trimStart)} - {formatTime(trimEnd)}</span>
            <span className="text-neutral-400">{formatTime(duration)}</span>
          </div>
          <div className="relative flex items-center">
            <input
              type="range"
              min="0"
              max={duration || 10}
              step="0.05"
              value={currentTime}
              onChange={(e) => {
                const targetSec = Number(e.target.value);
                setCurrentTime(targetSec);
                if (videoRef.current) {
                  videoRef.current.currentTime = targetSec;
                }
              }}
              className="w-full accent-rose-500 cursor-pointer h-2 rounded bg-neutral-800"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
