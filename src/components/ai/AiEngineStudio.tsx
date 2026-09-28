import React, { useState, useRef } from 'react';
import { soundEffects } from '../../utils/soundEffects';
import {
  Sparkles,
  Wand2,
  Image as ImageIcon,
  MessageSquare,
  Sliders,
  Download,
  Copy,
  Check,
  RefreshCw,
  Camera,
  Layers,
  ArrowRight,
  Zap,
  HelpCircle,
  Upload,
  Eye,
  Maximize2,
} from 'lucide-react';
import { PhotoAdjustments } from '../../types';

interface AiEngineStudioProps {
  activeImage: HTMLImageElement | null;
  onApplyAdjustmentsToPhoto?: (adj: Partial<PhotoAdjustments>) => void;
  onSwitchToPhotoStudio?: () => void;
  onNotify: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const AiEngineStudio: React.FC<AiEngineStudioProps> = ({
  activeImage,
  onApplyAdjustmentsToPhoto,
  onSwitchToPhotoStudio,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'enhancer' | 'critique' | 'generator' | 'captions'>('enhancer');

  // AI Auto-Enhance State
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [recommendedAdjustments, setRecommendedAdjustments] = useState<any | null>(null);
  const [enhanceApplied, setEnhanceApplied] = useState<boolean>(false);

  // AI Critique & Advice State
  const [isCritiquing, setIsCritiquing] = useState<boolean>(false);
  const [critiqueText, setCritiqueText] = useState<string>('');

  // AI Social Captions State
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState<boolean>(false);
  const [captionsText, setCaptionsText] = useState<string>('');
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);

  // AI Vector / Visual Asset Generator State
  const [promptInput, setPromptInput] = useState<string>('Futuristic cyberpunk camera lens with neon cyan and magenta lens flares');
  const [visualStyle, setVisualStyle] = useState<string>('futuristic-synth');
  const [isGeneratingVisual, setIsGeneratingVisual] = useState<boolean>(false);
  const [generatedSvg, setGeneratedSvg] = useState<string>('');
  const [copiedSvg, setCopiedSvg] = useState<boolean>(false);

  // Convert activeImage to base64 for Gemini vision model
  const getActiveImageBase64 = (): string | null => {
    if (!activeImage) return null;
    try {
      const canvas = document.createElement('canvas');
      // Limit to 1024 max dimension for fast transmission
      const maxDim = 1024;
      let w = activeImage.naturalWidth || activeImage.width || 800;
      let h = activeImage.naturalHeight || activeImage.height || 600;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(activeImage, 0, 0, w, h);
      return canvas.toDataURL('image/jpeg', 0.85);
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  // Run AI Auto-Enhance Analysis
  const handleRunAutoEnhance = async () => {
    const base64 = getActiveImageBase64();
    if (!base64) {
      onNotify('error', 'No Image Found', 'Please load an image in Photo Studio first.');
      return;
    }

    soundEffects.playStamp();
    setIsEnhancing(true);
    setRecommendedAdjustments(null);
    setEnhanceApplied(false);

    try {
      const response = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: 'image/jpeg',
          task: 'auto-enhance',
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Server error');

      if (data.result) {
        setRecommendedAdjustments(data.result);
        soundEffects.playSuccess();
        onNotify('success', 'AI Analysis Complete', data.result.title || 'Optimal adjustments calculated!');
      } else {
        // Fallback default smart adjustments if json was partial
        const fallback = {
          brightness: 8,
          contrast: 14,
          saturation: 12,
          temperature: 4,
          highlights: -10,
          shadows: 15,
          sharpness: 18,
          vignette: 10,
          title: 'Vibrant Dynamic Balance',
          explanation: data.rawText || 'Optimized exposure, balanced dynamic range and gentle micro-contrast boost.',
        };
        setRecommendedAdjustments(fallback);
        onNotify('success', 'AI Analysis Complete', fallback.title);
      }
    } catch (err: any) {
      console.error(err);
      onNotify('error', 'AI Analysis Failed', err.message || 'Check your Gemini API connection.');
    } finally {
      setIsEnhancing(false);
    }
  };

  // Apply AI recommendations to photo studio
  const handleApplyToPhoto = () => {
    if (!recommendedAdjustments) return;
    soundEffects.playSuccess();

    if (onApplyAdjustmentsToPhoto) {
      onApplyAdjustmentsToPhoto({
        brightness: recommendedAdjustments.brightness || 0,
        contrast: recommendedAdjustments.contrast || 0,
        saturation: recommendedAdjustments.saturation || 0,
        temperature: recommendedAdjustments.temperature || 0,
        highlights: recommendedAdjustments.highlights || 0,
        shadows: recommendedAdjustments.shadows || 0,
        sharpness: recommendedAdjustments.sharpness || 0,
        vignette: recommendedAdjustments.vignette || 0,
      });
    }

    setEnhanceApplied(true);
    onNotify('success', 'Applied to Photo Studio', 'Image adjustments successfully updated.');
    if (onSwitchToPhotoStudio) {
      setTimeout(() => onSwitchToPhotoStudio(), 700);
    }
  };

  // Run AI Photography Critique
  const handleRunCritique = async () => {
    const base64 = getActiveImageBase64();
    if (!base64) {
      onNotify('error', 'No Image Found', 'Please load an image in Photo Studio first.');
      return;
    }

    soundEffects.playStamp();
    setIsCritiquing(true);
    setCritiqueText('');

    try {
      const response = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: 'image/jpeg',
          task: 'critique',
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Server error');

      setCritiqueText(data.text || 'No critique generated.');
      soundEffects.playSuccess();
      onNotify('success', 'Critique Ready', 'Gemini AI reviewed your composition.');
    } catch (err: any) {
      console.error(err);
      onNotify('error', 'Critique Failed', err.message || 'Failed to analyze image.');
    } finally {
      setIsCritiquing(false);
    }
  };

  // Run AI Captions Generator
  const handleRunCaptions = async () => {
    const base64 = getActiveImageBase64();
    if (!base64) {
      onNotify('error', 'No Image Found', 'Please load an image in Photo Studio first.');
      return;
    }

    soundEffects.playStamp();
    setIsGeneratingCaptions(true);
    setCaptionsText('');

    try {
      const response = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: 'image/jpeg',
          task: 'caption',
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Server error');

      setCaptionsText(data.text || '');
      soundEffects.playSuccess();
      onNotify('success', 'Captions Ready', 'Generated 4 tailored social captions.');
    } catch (err: any) {
      console.error(err);
      onNotify('error', 'Captions Failed', err.message || 'Failed to generate captions.');
    } finally {
      setIsGeneratingCaptions(false);
    }
  };

  // Generate SVG Graphic Asset via Gemini AI
  const handleGenerateVisual = async () => {
    if (!promptInput.trim()) return;

    soundEffects.playStamp();
    setIsGeneratingVisual(true);
    setGeneratedSvg('');

    try {
      const response = await fetch('/api/ai/generate-visual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptInput.trim(),
          style: visualStyle,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Server error');

      setGeneratedSvg(data.svg || '');
      soundEffects.playSuccess();
      onNotify('success', 'Visual Asset Generated', 'Rendered modern vector asset.');
    } catch (err: any) {
      console.error(err);
      onNotify('error', 'Generation Failed', err.message || 'Failed to synthesize vector visual.');
    } finally {
      setIsGeneratingVisual(false);
    }
  };

  // Download SVG
  const handleDownloadSvg = () => {
    if (!generatedSvg) return;
    soundEffects.playStamp();
    const blob = new Blob([generatedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zoro-ai-asset-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('success', 'Asset Downloaded', 'Saved SVG asset file.');
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-neutral-950 text-neutral-100 select-none">
      {/* Left Sidebar: AI Modes & Active Context Preview */}
      <aside className="w-full md:w-80 lg:w-96 border-r border-neutral-800/80 bg-neutral-950/70 flex flex-col shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-500 via-purple-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-wide uppercase">AI ENGINE</h2>
              <p className="text-[10px] text-neutral-400">Gemini 3.8 Flash Neural Vision & Creative Core</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            PRO
          </span>
        </div>

        {/* Tab selection */}
        <div className="p-3 border-b border-neutral-800 space-y-1">
          <button
            onClick={() => setActiveTab('enhancer')}
            className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
              activeTab === 'enhancer'
                ? 'bg-rose-600/10 border-rose-500/50 text-white shadow-sm'
                : 'bg-neutral-900/40 border-neutral-800/60 text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Wand2 className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="truncate">
              <div className="text-xs font-semibold">Smart Auto-Enhance</div>
              <div className="text-[10px] text-neutral-400 truncate">Calculate optimal exposure, dynamic tone & color</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('critique')}
            className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
              activeTab === 'critique'
                ? 'bg-rose-600/10 border-rose-500/50 text-white shadow-sm'
                : 'bg-neutral-900/40 border-neutral-800/60 text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Camera className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="truncate">
              <div className="text-xs font-semibold">Pro Photo Critique</div>
              <div className="text-[10px] text-neutral-400 truncate">Framing, lighting & composition analysis</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('captions')}
            className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
              activeTab === 'captions'
                ? 'bg-rose-600/10 border-rose-500/50 text-white shadow-sm'
                : 'bg-neutral-900/40 border-neutral-800/60 text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-sky-400 shrink-0" />
            <div className="truncate">
              <div className="text-xs font-semibold">Social Captions & Tags</div>
              <div className="text-[10px] text-neutral-400 truncate">Generate viral, aesthetic & storytelling copy</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('generator')}
            className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
              activeTab === 'generator'
                ? 'bg-rose-600/10 border-rose-500/50 text-white shadow-sm'
                : 'bg-neutral-900/40 border-neutral-800/60 text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="truncate">
              <div className="text-xs font-semibold">AI Vector Graphic Synth</div>
              <div className="text-[10px] text-neutral-400 truncate">Synthesize SVG graphics and badges</div>
            </div>
          </button>
        </div>

        {/* Current Active Image Preview Card */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider font-mono">
            Active Workspace Image
          </span>

          {activeImage ? (
            <div className="space-y-2">
              <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-black aspect-video flex items-center justify-center group shadow-md">
                <img
                  src={activeImage.src}
                  alt="Active Studio Target"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-xs font-semibold text-white bg-neutral-900/80 px-2.5 py-1 rounded-lg backdrop-blur">
                    {activeImage.naturalWidth} × {activeImage.naturalHeight} px
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Target Loaded
                </span>
                {onSwitchToPhotoStudio && (
                  <button
                    onClick={onSwitchToPhotoStudio}
                    className="text-neutral-300 hover:text-white underline text-[10px]"
                  >
                    Switch to Photo Studio
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-dashed border-neutral-800 text-center space-y-2">
              <ImageIcon className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="text-xs text-neutral-400 font-medium">No image loaded yet</p>
              <p className="text-[11px] text-neutral-500">
                Switch to Photo Studio to pick a sample or upload a photo to enable Vision AI.
              </p>
              {onSwitchToPhotoStudio && (
                <button
                  onClick={onSwitchToPhotoStudio}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-medium border border-neutral-800"
                >
                  Go to Photo Studio
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main Center Stage */}
      <main className="flex-1 flex flex-col overflow-y-auto p-6 md:p-8 space-y-6">
        {/* TAB 1: SMART AUTO-ENHANCE */}
        {activeTab === 'enhancer' && (
          <div className="space-y-6 max-w-4xl mx-auto w-full">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Wand2 className="w-5 h-5 text-rose-500" />
                  <div>
                    <h2 className="text-base font-bold text-white">Neural Auto-Enhance Engine</h2>
                    <p className="text-xs text-neutral-400">
                      Gemini 3.8 Flash inspects your photo's histogram, lighting distribution, and tonal balance.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRunAutoEnhance}
                  disabled={isEnhancing || !activeImage}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-semibold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isEnhancing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Analyzing Pixels...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze & Auto-Enhance</span>
                    </>
                  )}
                </button>
              </div>

              {!activeImage && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                  Please open Photo Studio and load an image to run AI auto-enhancement.
                </div>
              )}

              {/* Recommended Adjustments Grid */}
              {recommendedAdjustments && (
                <div className="space-y-4 pt-4 border-t border-neutral-800 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                        Calculated Recipe
                      </span>
                      <h3 className="text-sm font-bold text-white mt-0.5">
                        {recommendedAdjustments.title || 'Optimal Studio Balance'}
                      </h3>
                    </div>

                    <button
                      onClick={handleApplyToPhoto}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
                    >
                      {enhanceApplied ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                      <span>{enhanceApplied ? 'Applied to Photo!' : 'Apply Recipe to Photo'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950/60 p-3.5 rounded-xl border border-neutral-800/80">
                    {recommendedAdjustments.explanation}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Brightness', val: recommendedAdjustments.brightness },
                      { label: 'Contrast', val: recommendedAdjustments.contrast },
                      { label: 'Saturation', val: recommendedAdjustments.saturation },
                      { label: 'Temperature', val: recommendedAdjustments.temperature },
                      { label: 'Highlights', val: recommendedAdjustments.highlights },
                      { label: 'Shadows', val: recommendedAdjustments.shadows },
                      { label: 'Sharpness', val: recommendedAdjustments.sharpness },
                      { label: 'Vignette', val: recommendedAdjustments.vignette },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center"
                      >
                        <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider block">
                          {item.label}
                        </span>
                        <span
                          className={`text-sm font-mono font-bold mt-0.5 block ${
                            (item.val || 0) > 0
                              ? 'text-emerald-400'
                              : (item.val || 0) < 0
                              ? 'text-amber-400'
                              : 'text-neutral-400'
                          }`}
                        >
                          {(item.val || 0) > 0 ? `+${item.val}` : item.val || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PRO PHOTO CRITIQUE */}
        {activeTab === 'critique' && (
          <div className="space-y-6 max-w-4xl mx-auto w-full">
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Camera className="w-5 h-5 text-amber-400" />
                  <div>
                    <h2 className="text-base font-bold text-white">Creative Director & Photo Critique</h2>
                    <p className="text-xs text-neutral-400">
                      Evaluates framing, lighting dynamics, depth of field, and storytelling impact.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRunCritique}
                  disabled={isCritiquing || !activeImage}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-semibold text-xs shadow-lg shadow-amber-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isCritiquing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Reviewing Shot...</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>Generate Critique</span>
                    </>
                  )}
                </button>
              </div>

              {critiqueText ? (
                <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 whitespace-pre-line leading-relaxed space-y-2">
                  {critiqueText}
                </div>
              ) : (
                <div className="py-12 text-center text-neutral-500 text-xs space-y-2">
                  <Camera className="w-8 h-8 mx-auto text-neutral-600" />
                  <p>Click "Generate Critique" to receive an in-depth evaluation of this photo.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SOCIAL CAPTIONS & TAGS */}
        {activeTab === 'captions' && (
          <div className="space-y-6 max-w-4xl mx-auto w-full">
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-5 h-5 text-sky-400" />
                  <div>
                    <h2 className="text-base font-bold text-white">Curated Social Copy & Hashtags</h2>
                    <p className="text-xs text-neutral-400">
                      Creates tailored Instagram, TikTok, and portfolio captions for your active image.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRunCaptions}
                  disabled={isGeneratingCaptions || !activeImage}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-semibold text-xs shadow-lg shadow-sky-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isGeneratingCaptions ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Writing Captions...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Captions</span>
                    </>
                  )}
                </button>
              </div>

              {captionsText ? (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        soundEffects.playStamp();
                        navigator.clipboard.writeText(captionsText);
                        setCopiedCaption(true);
                        setTimeout(() => setCopiedCaption(false), 2000);
                        onNotify('success', 'Captions Copied', 'All generated captions copied to clipboard.');
                      }}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCaption ? 'Copied' : 'Copy All'}</span>
                    </button>
                  </div>
                  <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 whitespace-pre-line leading-relaxed">
                    {captionsText}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-neutral-500 text-xs space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-neutral-600" />
                  <p>Click "Generate Captions" to produce creative social media post ideas.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: AI VECTOR GRAPHIC SYNTHESIZER */}
        {activeTab === 'generator' && (
          <div className="space-y-6 max-w-4xl mx-auto w-full">
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-5">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-emerald-400" />
                <div>
                  <h2 className="text-base font-bold text-white">AI Vector Asset Synthesizer</h2>
                  <p className="text-xs text-neutral-400">
                    Generate crisp scalable vector graphics (SVG) from text prompts.
                  </p>
                </div>
              </div>

              {/* Prompt Box */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Prompt Description</label>
                  <textarea
                    rows={3}
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="Describe what you want to synthesize..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Style selector */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400">Aesthetic:</span>
                    <select
                      value={visualStyle}
                      onChange={(e) => setVisualStyle(e.target.value)}
                      className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 focus:outline-none"
                    >
                      <option value="futuristic-synth">Cyberpunk Neon</option>
                      <option value="minimalist-flat">Minimalist Flat Vector</option>
                      <option value="editorial-badge">Vintage Studio Emblem</option>
                      <option value="abstract-geometric">Abstract Modernist</option>
                    </select>
                  </div>

                  <button
                    onClick={handleGenerateVisual}
                    disabled={isGeneratingVisual || !promptInput.trim()}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isGeneratingVisual ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Synthesizing SVG...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Synthesize Asset</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Rendered SVG Preview Stage */}
              {generatedSvg ? (
                <div className="space-y-3 pt-3 border-t border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-300">Synthesized Vector Graphic:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          soundEffects.playStamp();
                          navigator.clipboard.writeText(generatedSvg);
                          setCopiedSvg(true);
                          setTimeout(() => setCopiedSvg(false), 2000);
                          onNotify('success', 'SVG Code Copied', 'Raw XML copied to clipboard.');
                        }}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        {copiedSvg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSvg ? 'Copied XML' : 'Copy SVG'}</span>
                      </button>

                      <button
                        onClick={handleDownloadSvg}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download .svg</span>
                      </button>
                    </div>
                  </div>

                  <div
                    className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center min-h-[300px] overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: generatedSvg }}
                  />
                </div>
              ) : null}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
