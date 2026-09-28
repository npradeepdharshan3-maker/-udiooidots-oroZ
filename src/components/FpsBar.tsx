import React, { useEffect, useRef, useState } from 'react';
import { Activity, Gauge, ChevronDown, ChevronUp, Cpu, Zap, EyeOff } from 'lucide-react';

interface FpsBarProps {
  canvasWidth?: number;
  canvasHeight?: number;
  onClose?: () => void;
}

export const FpsBar: React.FC<FpsBarProps> = ({ canvasWidth, canvasHeight, onClose }) => {
  const [fps, setFps] = useState<number>(60);
  const [frameTime, setFrameTime] = useState<number>(16.6);
  const [minFps, setMinFps] = useState<number>(60);
  const [maxFps, setMaxFps] = useState<number>(60);
  const [history, setHistory] = useState<number[]>(() => new Array(24).fill(60));
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const lastFrameTimeRef = useRef(performance.now());
  const historyRef = useRef<number[]>(new Array(24).fill(60));
  const minFpsRef = useRef(60);
  const maxFpsRef = useRef(60);

  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      now = performance.now();
      frameCountRef.current++;

      // Update FPS stats roughly every 250ms for stable readability
      const elapsedSinceSample = now - lastTimeRef.current;
      if (elapsedSinceSample >= 250) {
        const computedFps = Math.round((frameCountRef.current * 1000) / elapsedSinceSample);
        const computedFrameTime = +(1000 / Math.max(computedFps, 1)).toFixed(1);

        setFps(computedFps);
        setFrameTime(computedFrameTime);

        // Update min/max tracker
        if (computedFps > 0) {
          minFpsRef.current = Math.min(minFpsRef.current, computedFps);
          maxFpsRef.current = Math.max(maxFpsRef.current, computedFps);
          setMinFps(minFpsRef.current);
          setMaxFps(maxFpsRef.current);
        }

        // Push to rolling history sparkline
        historyRef.current = [...historyRef.current.slice(1), computedFps];
        setHistory([...historyRef.current]);

        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Determine health color
  const getStatusColor = (val: number) => {
    if (val >= 55) return { text: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500/30' };
    if (val >= 35) return { text: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/30' };
    return { text: 'text-rose-400', bg: 'bg-rose-500', border: 'border-rose-500/30' };
  };

  const status = getStatusColor(fps);
  const targetFps = maxFps > 75 ? 120 : 60;
  const fpsPercent = Math.min(100, Math.round((fps / targetFps) * 100));

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-3 left-4 z-40 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 text-[11px] font-mono shadow-lg backdrop-blur-md transition-all select-none"
        title="Show FPS performance meter"
      >
        <Activity className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-semibold text-neutral-200">{fps} FPS</span>
      </button>
    );
  }

  return (
    <aside
      aria-label="Performance Telemetry"
      className="fixed bottom-3 left-4 z-40 select-none flex flex-col font-mono text-[11px] transition-all duration-200"
    >
      <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border bg-neutral-950/95 backdrop-blur-md shadow-2xl ${status.border}`}>
        {/* Pulsing state dot */}
        <div className="relative flex items-center justify-center">
          <div className={`w-2 h-2 rounded-full ${status.bg}`} />
          <div className={`absolute w-3.5 h-3.5 rounded-full ${status.bg} opacity-30 animate-ping`} />
        </div>

        {/* FPS Value Display */}
        <div className="flex items-baseline gap-1">
          <span className={`text-sm font-bold tracking-tight ${status.text}`}>
            {fps}
          </span>
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">FPS</span>
        </div>

        <div className="h-3 w-px bg-neutral-800" />

        {/* Frame Latency (ms) */}
        <div className="flex items-center gap-1 text-neutral-400 hidden sm:flex">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>{frameTime}ms</span>
        </div>

        {/* Real-time mini sparkline bar chart */}
        <div className="flex items-end gap-0.5 h-4.5 w-16 px-1 py-0.5 bg-neutral-900/80 rounded border border-neutral-800/80">
          {history.map((val, idx) => {
            const barHeight = Math.max(15, Math.min(100, Math.round((val / targetFps) * 100)));
            const barColor =
              val >= 55 ? 'bg-emerald-400' : val >= 35 ? 'bg-amber-400' : 'bg-rose-400';
            return (
              <div
                key={idx}
                style={{ height: `${barHeight}%` }}
                className={`flex-1 rounded-[1px] transition-all duration-150 ${barColor}`}
              />
            );
          })}
        </div>

        {/* Expand / Minimize Controls */}
        <div className="flex items-center gap-0.5 border-l border-neutral-800/80 pl-1.5">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 transition-colors"
            title={isExpanded ? 'Collapse FPS stats' : 'Expand full performance details'}
            aria-label={isExpanded ? 'Collapse FPS stats' : 'Expand full performance details'}
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => {
              if (onClose) onClose();
              else setIsMinimized(true);
            }}
            className="p-1 rounded text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/60 transition-colors"
            title="Minimize FPS bar"
            aria-label="Minimize FPS bar"
          >
            <EyeOff className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Expanded Performance Drawer */}
      {isExpanded && (
        <div className="mt-1.5 p-3 rounded-xl border border-neutral-800/90 bg-neutral-950/95 backdrop-blur-md shadow-2xl text-neutral-300 space-y-2.5 w-64 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between text-[10px] text-neutral-400 font-semibold uppercase tracking-wider border-b border-neutral-800/80 pb-1.5">
            <span className="flex items-center gap-1.5 text-neutral-200">
              <Gauge className="w-3.5 h-3.5 text-rose-500" />
              Canvas Performance
            </span>
            <span className={status.text}>{fps >= 55 ? 'Optimal' : fps >= 35 ? 'Moderate' : 'Throttled'}</span>
          </div>

          {/* Meter progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-neutral-400">
              <span>Frame Budget</span>
              <span>{fpsPercent}% of {targetFps}Hz</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
              <div
                style={{ width: `${fpsPercent}%` }}
                className={`h-full rounded-full transition-all duration-200 ${status.bg}`}
              />
            </div>
          </div>

          {/* Detailed Statistics Grid */}
          <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
            <div className="p-1.5 rounded-lg bg-neutral-900/60 border border-neutral-800/60 flex flex-col">
              <span className="text-neutral-500">Min / Max FPS</span>
              <span className="font-semibold text-neutral-200">{minFps} / {maxFps}</span>
            </div>
            <div className="p-1.5 rounded-lg bg-neutral-900/60 border border-neutral-800/60 flex flex-col">
              <span className="text-neutral-500">Target Latency</span>
              <span className="font-semibold text-neutral-200">{(1000 / targetFps).toFixed(1)}ms</span>
            </div>
          </div>

          {/* Active Canvas Dimensions (if available) */}
          {canvasWidth && canvasHeight && (
            <div className="p-1.5 rounded-lg bg-neutral-900/60 border border-neutral-800/60 flex items-center justify-between text-[10px]">
              <span className="text-neutral-500 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-neutral-400" />
                Render Buffer
              </span>
              <span className="text-neutral-300 font-semibold">{canvasWidth} × {canvasHeight}</span>
            </div>
          )}

          <div className="text-[9px] text-neutral-500 text-center pt-0.5">
            Hardware Accelerated WebGL / 2D Canvas
          </div>
        </div>
      )}
    </aside>
  );
};
