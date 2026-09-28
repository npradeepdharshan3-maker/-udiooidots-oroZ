import React, { useRef } from 'react';
import { StudioWorkspace } from '../types';
import { User } from 'firebase/auth';
import {
  SlidersHorizontal,
  Film,
  Music,
  Sparkles,
  LayoutTemplate,
  FileText,
  Palette,
  Upload,
  Undo2,
  Redo2,
  Download,
  HelpCircle,
  Activity,
  Cloud,
  LogOut,
  User as UserIcon,
  Smartphone,
} from 'lucide-react';
import { VolumeControl } from './VolumeControl';

interface HeaderProps {
  currentWorkspace: StudioWorkspace;
  onWorkspaceChange: (ws: StudioWorkspace) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenExport: () => void;
  onImageUploaded: (file: File) => void;
  onOpenShortcuts: () => void;
  showFpsBar: boolean;
  onToggleFpsBar: () => void;
  onOpenAppDownload: () => void;
  // Google Account props
  googleUser: User | null;
  isLoggingIn: boolean;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  onOpenDrivePicker: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentWorkspace,
  onWorkspaceChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenExport,
  onImageUploaded,
  onOpenShortcuts,
  showFpsBar,
  onToggleFpsBar,
  onOpenAppDownload,
  googleUser,
  isLoggingIn,
  onGoogleSignIn,
  onGoogleSignOut,
  onOpenDrivePicker,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUploaded(file);
      e.target.value = '';
    }
  };

  const workspaces: { id: StudioWorkspace; label: string; icon: React.ReactNode }[] = [
    { id: 'photo', label: 'Photo Studio', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
    { id: 'video', label: 'Video Studio', icon: <Film className="w-3.5 h-3.5" /> },
    { id: 'audio', label: 'Music & Songs', icon: <Music className="w-3.5 h-3.5" /> },
    { id: 'ai', label: 'AI Engine', icon: <Sparkles className="w-3.5 h-3.5 text-rose-400" /> },
    { id: 'graphics', label: 'Graphic Design', icon: <LayoutTemplate className="w-3.5 h-3.5" /> },
    { id: 'editorial', label: 'Editorial & Text', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'palette', label: 'Color Lab', icon: <Palette className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="h-14 border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* Brand logo & name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 via-teal-600 to-rose-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white font-bold text-xs font-display tracking-wider">Z</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-sm tracking-tight text-white">ZORO.</span>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-semibold">STUDIO</span>
            </div>
          </div>
        </div>

        <div className="h-4 w-px bg-neutral-800 mx-1 hidden sm:block" />

        {/* Workspace Switcher */}
        <nav className="flex items-center p-0.5 bg-neutral-900 border border-neutral-800 rounded-lg">
          {workspaces.map((ws) => {
            const isActive = currentWorkspace === ws.id;
            return (
              <button
                key={ws.id}
                onClick={() => onWorkspaceChange(ws.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                }`}
              >
                {ws.icon}
                <span className="hidden md:inline">{ws.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo (Relevant for Photo & Graphics) */}
        {(currentWorkspace === 'photo' || currentWorkspace === 'graphics') && (
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 mr-1">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Shift+Z)"
              className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-colors"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Upload file */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 rounded-lg text-xs font-medium transition-colors"
          title="Open local image file"
        >
          <Upload className="w-3.5 h-3.5 text-neutral-400" />
          <span>Open Image</span>
        </button>

        {/* Google Drive / Account Actions */}
        {googleUser ? (
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-lg p-1">
            <button
              onClick={onOpenDrivePicker}
              className="flex items-center gap-1.5 px-2 py-1 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 rounded transition-colors"
              title="Browse images from Google Drive"
            >
              <Cloud className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">Drive</span>
            </button>
            <div className="h-3 w-px bg-neutral-800" />
            <div className="flex items-center gap-1.5 px-1.5">
              {googleUser.photoURL ? (
                <img
                  src={googleUser.photoURL}
                  alt={googleUser.displayName || 'Google Account'}
                  className="w-5 h-5 rounded-full border border-neutral-700 object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-rose-600/30 text-rose-400 flex items-center justify-center text-[10px] font-bold">
                  {googleUser.displayName ? googleUser.displayName.charAt(0).toUpperCase() : 'G'}
                </div>
              )}
              <span className="text-xs text-neutral-200 max-w-[90px] truncate hidden lg:inline font-medium">
                {googleUser.displayName?.split(' ')[0] || 'Account'}
              </span>
            </div>
            <button
              onClick={onGoogleSignOut}
              className="p-1 rounded text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
              title="Sign out of Google"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onGoogleSignIn}
            disabled={isLoggingIn}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-200 rounded-lg text-xs font-medium transition-all shadow-sm disabled:opacity-50"
            title="Sign in with your Google account"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
          </button>
        )}

        {/* Volume & Audio Feedback Control */}
        <VolumeControl />

        {/* FPS Bar Toggle */}
        <button
          onClick={onToggleFpsBar}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium transition-colors ${
            showFpsBar
              ? 'bg-neutral-800 text-emerald-400 border-neutral-700 shadow-sm'
              : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border-neutral-800'
          }`}
          title="Toggle FPS Performance Bar (F)"
        >
          <Activity className={`w-3.5 h-3.5 ${showFpsBar ? 'text-emerald-400' : 'text-neutral-400'}`} />
          <span className="hidden sm:inline">FPS</span>
        </button>

        {/* Download App / PWA Install */}
        <button
          onClick={onOpenAppDownload}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-rose-300 hover:text-white rounded-lg text-xs font-medium transition-all shadow-sm active:scale-95"
          title="Download App / Install on Mobile or PC"
        >
          <Smartphone className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">Install App</span>
        </button>

        {/* Shortcuts */}
        <button
          onClick={onOpenShortcuts}
          className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent hover:border-neutral-800 rounded-lg transition-colors"
          title="Keyboard shortcuts (?)"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Export CTA */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-rose-600/20 transition-colors active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
