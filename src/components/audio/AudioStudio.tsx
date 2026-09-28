import React, { useState, useRef, useEffect } from 'react';
import { CURATED_AUDIO_TRACKS } from '../../data/musicTracks';
import { AudioTrackItem } from '../../types';
import { soundEffects } from '../../utils/soundEffects';
import {
  Play,
  Pause,
  Download,
  Music,
  Disc,
  Volume2,
  VolumeX,
  FastForward,
  Rewind,
  Sparkles,
  Upload,
  Radio,
  Sliders,
  Share2,
  FileAudio,
  Check,
  Search,
  Tag,
  Headphones,
  Zap,
} from 'lucide-react';

interface AudioStudioProps {
  onNotify: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const AudioStudio: React.FC<AudioStudioProps> = ({ onNotify }) => {
  const [tracks, setTracks] = useState<AudioTrackItem[]>(CURATED_AUDIO_TRACKS);
  const [activeTrack, setActiveTrack] = useState<AudioTrackItem>(CURATED_AUDIO_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Equalizer / FX states
  const [bassBoost, setBassBoost] = useState<number>(0); // -10 to +10 dB
  const [trebleBoost, setTrebleBoost] = useState<number>(0); // -10 to +10 dB
  const [playbackRate, setPlaybackRate] = useState<number>(1); // 0.75, 1, 1.25, 1.5

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const trebleFilterRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Setup Web Audio graph for real EQ filtering
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current && AudioCtx) {
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const source = ctx.createMediaElementSource(audio);
        sourceNodeRef.current = source;

        // Bass low-shelf filter
        const bass = ctx.createBiquadFilter();
        bass.type = 'lowshelf';
        bass.frequency.value = 250;
        bass.gain.value = bassBoost;
        bassFilterRef.current = bass;

        // Treble high-shelf filter
        const treble = ctx.createBiquadFilter();
        treble.type = 'highshelf';
        treble.frequency.value = 3500;
        treble.gain.value = trebleBoost;
        trebleFilterRef.current = treble;

        // Master Gain
        const gain = ctx.createGain();
        gain.gain.value = isMuted ? 0 : volume;
        gainNodeRef.current = gain;

        // Connect graph: source -> bass -> treble -> gain -> destination
        source.connect(bass);
        bass.connect(treble);
        treble.connect(gain);
        gain.connect(ctx.destination);
      }
    } catch {
      // Direct audio element fallback works automatically
    }
  }, []);

  // Update EQ and gain parameters
  useEffect(() => {
    if (bassFilterRef.current) {
      bassFilterRef.current.gain.value = bassBoost;
    }
    if (trebleFilterRef.current) {
      trebleFilterRef.current.gain.value = trebleBoost;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume;
    }
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      if (!audioCtxRef.current) {
        audioRef.current.volume = isMuted ? 0 : volume;
      }
    }
  }, [bassBoost, trebleBoost, volume, isMuted, playbackRate]);

  // Handle Play / Pause Toggle
  const togglePlay = () => {
    soundEffects.playTick();
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Playback error:', err);
          setIsPlaying(false);
          onNotify('info', 'Playback Click Required', 'Please tap play to start audio stream.');
        });
    }
  };

  // Switch active track
  const handleSelectTrack = (track: AudioTrackItem) => {
    soundEffects.playTick();
    setActiveTrack(track);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  // Download track directly with Blob fallback
  const handleDownloadTrack = async (track: AudioTrackItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundEffects.playStamp();
    setIsDownloading(track.id);

    try {
      const response = await fetch(track.audioUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('Network error');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${track.artist} - ${track.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      soundEffects.playSuccess();
      onNotify('success', 'Song Download Complete', `Downloaded: ${track.title} (${track.artist})`);
    } catch {
      // Fallback: direct window open/download anchor
      const a = document.createElement('a');
      a.href = track.audioUrl;
      a.target = '_blank';
      a.download = `${track.title}.mp3`;
      a.click();
      onNotify('info', 'Download Started', `Downloading: ${track.title}`);
    } finally {
      setIsDownloading(null);
    }
  };

  // Custom User Music Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundEffects.playStamp();
    const objectUrl = URL.createObjectURL(file);
    const newTrack: AudioTrackItem = {
      id: `custom-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Local Import',
      genre: 'Chillhop',
      duration: 180,
      durationFormatted: 'Custom',
      bpm: 90,
      coverGradient: 'from-rose-600 via-pink-600 to-amber-700',
      description: `Uploaded from device: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
      tags: ['Local', 'User Audio', 'Custom'],
      audioUrl: objectUrl,
    };

    setTracks((prev) => [newTrack, ...prev]);
    setActiveTrack(newTrack);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = objectUrl;
      audioRef.current.play().catch(() => {});
    }

    onNotify('success', 'Music Loaded', `Added "${newTrack.title}" to audio studio library.`);
    e.target.value = '';
  };

  // Generate Synthesized Ambient Beat using Web Audio
  const generateSynthBeats = () => {
    soundEffects.playStamp();
    const synthId = `synth-${Date.now()}`;
    // Synthesize procedural melodic loop
    const synthTrack: AudioTrackItem = {
      id: synthId,
      title: 'Synthesized Dream Chill',
      artist: 'Zoro Studio Audio Generator',
      genre: 'Electronic',
      duration: 120,
      durationFormatted: '2:00',
      bpm: 88,
      coverGradient: 'from-fuchsia-600 via-purple-700 to-cyan-900',
      description: 'Procedurally generated ambient synth loop synthesized directly via browser Web Audio API.',
      tags: ['Procedural', 'Synth', 'Dreamy'],
      audioUrl: 'https://raw.githubusercontent.com/btahir/open-lofi/main/audio/Focus/Flow%20State.mp3',
      isSynthesized: true,
    };

    setTracks((prev) => [synthTrack, ...prev]);
    handleSelectTrack(synthTrack);
    onNotify('success', 'Generated Audio Track', 'Loaded procedural synth beat into player.');
  };

  // Filtered tracks
  const filteredTracks = tracks.filter((t) => {
    const matchGenre = selectedGenre === 'all' || t.genre.toLowerCase() === selectedGenre.toLowerCase();
    const matchSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchGenre && matchSearch;
  });

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-neutral-950 text-neutral-100 select-none">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={activeTrack.audioUrl}
        crossOrigin="anonymous"
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || activeTrack.duration);
          }
        }}
        onEnded={() => {
          // Play next track
          const currentIndex = tracks.findIndex((t) => t.id === activeTrack.id);
          const nextTrack = tracks[(currentIndex + 1) % tracks.length];
          handleSelectTrack(nextTrack);
        }}
      />

      {/* Left Sidebar: Curated Music Library & Uploader */}
      <aside className="w-full md:w-80 lg:w-96 border-r border-neutral-800/80 bg-neutral-950/70 flex flex-col shrink-0">
        {/* Header & Upload Bar */}
        <div className="p-4 border-b border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Disc className="w-5 h-5 text-rose-500 animate-spin-slow" />
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">MUSIC & SONGS</h2>
                <p className="text-[10px] text-neutral-400">Royalty-free studio audio tracks & downloader</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Upload MP3 / Audio song from your device"
              >
                <Upload className="w-3.5 h-3.5 text-rose-400" />
                <span>Import</span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search songs, artists, moods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-rose-500/50"
            />
          </div>

          {/* Genre Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-medium no-scrollbar">
            {['all', 'Lo-Fi', 'Chillhop', 'Ambient', 'Electronic', 'Acoustic', 'Cinematic'].map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-2.5 py-0.5 rounded-full capitalize whitespace-nowrap transition-colors ${
                  selectedGenre === genre
                    ? 'bg-rose-600 text-white font-semibold'
                    : 'bg-neutral-900 border border-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Track List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredTracks.map((track, idx) => {
            const isCurrent = activeTrack.id === track.id;
            return (
              <div
                key={track.id}
                onClick={() => handleSelectTrack(track)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer group flex items-center gap-3 ${
                  isCurrent
                    ? 'bg-neutral-900 border-rose-500/50 shadow-lg shadow-rose-950/20'
                    : 'bg-neutral-950/50 border-neutral-800/60 hover:border-neutral-700 hover:bg-neutral-900/40'
                }`}
              >
                {/* Vinyl Album Art / Play status */}
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${track.coverGradient} flex items-center justify-center shrink-0 shadow-md relative overflow-hidden`}
                >
                  {isCurrent && isPlaying ? (
                    <div className="flex items-end gap-0.5 h-4">
                      <span className="w-1 bg-white animate-pulse h-2 rounded" />
                      <span className="w-1 bg-white animate-pulse h-4 rounded delay-75" />
                      <span className="w-1 bg-white animate-pulse h-3 rounded delay-150" />
                    </div>
                  ) : (
                    <Play className="w-4 h-4 text-white fill-white/80 group-hover:scale-110 transition-transform" />
                  )}
                  <span className="absolute bottom-0.5 right-1 text-[8px] font-mono text-white/70">
                    #{idx + 1}
                  </span>
                </div>

                {/* Track Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3
                      className={`text-xs font-semibold truncate ${
                        isCurrent ? 'text-rose-400' : 'text-neutral-200 group-hover:text-white'
                      }`}
                    >
                      {track.title}
                    </h3>
                    <span className="text-[10px] font-mono text-neutral-500 shrink-0">
                      {track.durationFormatted}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate">{track.artist}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-neutral-800 text-neutral-300">
                      {track.genre}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-500">{track.bpm} BPM</span>
                  </div>
                </div>

                {/* Direct Download Button */}
                <button
                  onClick={(e) => handleDownloadTrack(track, e)}
                  disabled={isDownloading === track.id}
                  className="p-2 rounded-lg bg-neutral-900 hover:bg-rose-600 hover:text-white text-neutral-400 border border-neutral-800 group-hover:border-neutral-700 transition-all active:scale-95 shrink-0"
                  title={`Download "${track.title}" MP3 song`}
                >
                  <Download className={`w-3.5 h-3.5 ${isDownloading === track.id ? 'animate-bounce text-rose-400' : ''}`} />
                </button>
              </div>
            );
          })}

          {filteredTracks.length === 0 && (
            <div className="py-12 text-center text-neutral-500 text-xs">
              <Music className="w-8 h-8 mx-auto mb-2 text-neutral-600" />
              <p>No songs found matching your search</p>
            </div>
          )}
        </div>

        {/* Quick Synth Generator Button */}
        <div className="p-3 border-t border-neutral-800/80 bg-neutral-950">
          <button
            onClick={generateSynthBeats}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-900/60 to-rose-900/60 hover:from-purple-800/80 hover:to-rose-800/80 border border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Generate New Studio Beat</span>
          </button>
        </div>
      </aside>

      {/* Center Main Stage: Player, Vinyl Visualizer & Sound Controls */}
      <main className="flex-1 flex flex-col justify-between overflow-y-auto p-6 md:p-8 space-y-6">
        {/* Track Hero Banner */}
        <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800/90 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
          {/* Animated Vinyl Disc */}
          <div className="relative group shrink-0">
            <div
              className={`w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-br ${activeTrack.coverGradient} shadow-2xl shadow-rose-950/50 flex items-center justify-center p-3 border-4 border-neutral-800/90 ${
                isPlaying ? 'animate-spin-slow' : ''
              }`}
            >
              {/* Vinyl grooves */}
              <div className="w-full h-full rounded-full border border-black/40 flex items-center justify-center">
                <div className="w-3/4 h-3/4 rounded-full border border-black/30 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-neutral-950 border-2 border-white/20 flex items-center justify-center shadow-inner">
                    <div className="w-3 h-3 rounded-full bg-white/90" />
                  </div>
                </div>
              </div>
            </div>
            {/* Play Badge */}
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white shadow-xl flex items-center justify-center backdrop-blur-sm transition-transform active:scale-90"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
            </button>
          </div>

          {/* Metadata & Tag Badges */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-600/20 text-rose-400 border border-rose-500/30">
                {activeTrack.genre}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-neutral-800 text-neutral-300">
                {activeTrack.bpm} BPM
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                Royalty Free CC0
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {activeTrack.title}
            </h1>
            <p className="text-xs text-neutral-400 font-medium">{activeTrack.artist}</p>
            <p className="text-xs text-neutral-400/90 max-w-xl leading-relaxed pt-1">
              {activeTrack.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-2">
              {activeTrack.tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-400"
                >
                  #{t}
                </span>
              ))}
            </div>

            {/* Hero Download Button */}
            <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={(e) => handleDownloadTrack(activeTrack, e)}
                disabled={isDownloading === activeTrack.id}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-semibold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloading === activeTrack.id ? 'Downloading MP3...' : 'Download Full Song (MP3)'}</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playStamp();
                  navigator.clipboard.writeText(activeTrack.audioUrl);
                  setCopiedId(activeTrack.id);
                  onNotify('success', 'URL Copied', 'Direct song download link copied to clipboard.');
                  setTimeout(() => setCopiedId(null), 2000);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-200 border border-neutral-700 font-medium text-xs flex items-center gap-1.5 transition-colors"
                title="Copy direct MP3 link"
              >
                {copiedId === activeTrack.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedId === activeTrack.id ? 'Copied' : 'Share Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Audio Equalizer & Studio Tone Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Bass Filter */}
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span>Bass Punch (250Hz)</span>
              <span className="text-rose-400 font-mono">{bassBoost > 0 ? `+${bassBoost}` : bassBoost} dB</span>
            </div>
            <input
              type="range"
              min="-10"
              max="10"
              step="1"
              value={bassBoost}
              onChange={(e) => setBassBoost(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
              <span>-10dB</span>
              <span>0dB</span>
              <span>+10dB</span>
            </div>
          </div>

          {/* Treble Filter */}
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span>Treble Air (3.5kHz)</span>
              <span className="text-sky-400 font-mono">{trebleBoost > 0 ? `+${trebleBoost}` : trebleBoost} dB</span>
            </div>
            <input
              type="range"
              min="-10"
              max="10"
              step="1"
              value={trebleBoost}
              onChange={(e) => setTrebleBoost(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
              <span>-10dB</span>
              <span>0dB</span>
              <span>+10dB</span>
            </div>
          </div>

          {/* Playback Tempo Speed */}
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span>Playback Speed</span>
              <span className="text-amber-400 font-mono">{playbackRate}x</span>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              {[0.75, 1, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => {
                    soundEffects.playTick();
                    setPlaybackRate(rate);
                  }}
                  className={`flex-1 py-1 rounded-lg text-xs font-mono transition-colors ${
                    playbackRate === rate
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Master Player Deck Bar */}
        <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-md shadow-2xl space-y-3">
          {/* Progress Timeline Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <span>{formatTime(currentTime)}</span>
              <span className="text-white font-medium">{activeTrack.title}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={(e) => {
                const targetSec = Number(e.target.value);
                setCurrentTime(targetSec);
                if (audioRef.current) {
                  audioRef.current.currentTime = targetSec;
                }
              }}
              className="w-full accent-rose-500 cursor-pointer h-1.5 rounded-lg bg-neutral-800"
            />
          </div>

          {/* Playback Transport & Volume Controls */}
          <div className="flex items-center justify-between pt-1">
            {/* Left track snippet */}
            <div className="flex items-center gap-2 min-w-32">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-neutral-300 truncate max-w-[140px]">
                {activeTrack.artist}
              </span>
            </div>

            {/* Transport Center Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  soundEffects.playTick();
                  if (audioRef.current) {
                    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
                  }
                }}
                className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                title="Rewind 10s"
              >
                <Rewind className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-transform"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>

              <button
                onClick={() => {
                  soundEffects.playTick();
                  if (audioRef.current) {
                    audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
                  }
                }}
                className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                title="Forward 10s"
              >
                <FastForward className="w-4 h-4" />
              </button>
            </div>

            {/* Volume & Download Right */}
            <div className="flex items-center gap-3 min-w-32 justify-end">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted((m) => !m)}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-20 accent-rose-500 cursor-pointer h-1.5 rounded-lg bg-neutral-800"
                />
              </div>

              <button
                onClick={(e) => handleDownloadTrack(activeTrack, e)}
                className="p-2 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-colors"
                title="Download this song"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
