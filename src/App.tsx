import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StudioWorkspace,
  PhotoAdjustments,
  TransformState,
  CropState,
  CanvasAnnotation,
  PresetFilterId,
  HistoryEntry,
} from './types';
import { DEFAULT_ADJUSTMENTS, DEFAULT_TRANSFORM, renderCompositionToCanvas } from './utils/canvasUtils';
import { Header } from './components/Header';
import { PhotoStudio } from './components/photo/PhotoStudio';
import { VideoStudio } from './components/video/VideoStudio';
import { AudioStudio } from './components/audio/AudioStudio';
import { AiEngineStudio } from './components/ai/AiEngineStudio';
import { GraphicStudio } from './components/graphics/GraphicStudio';
import { EditorialStudio } from './components/editorial/EditorialStudio';
import { PaletteLab } from './components/palette/PaletteLab';
import { ExportModal } from './components/photo/ExportModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { AppDownloadModal } from './components/AppDownloadModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { FpsBar } from './components/FpsBar';
import { DrivePickerModal } from './components/DrivePickerModal';
import { initAuth, googleSignIn, googleSignOut } from './services/auth';
import { uploadImageToDrive } from './services/drive';
import { soundEffects } from './utils/soundEffects';
import { User } from 'firebase/auth';

export default function App() {
  const [currentWorkspace, setCurrentWorkspace] = useState<StudioWorkspace>('photo');
  const [externalImageFile, setExternalImageFile] = useState<File | null>(null);

  // Google Account & Drive Integration State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState<boolean>(false);

  // Active Photo Studio State
  const [activeImage, setActiveImage] = useState<HTMLImageElement | null>(null);
  const [currentAdjustments, setAdjustments] = useState<PhotoAdjustments>(DEFAULT_ADJUSTMENTS);
  const [activePresetId, setActivePresetId] = useState<PresetFilterId>('normal');
  const [transform, setTransform] = useState<TransformState>(DEFAULT_TRANSFORM);
  const [annotations, setAnnotations] = useState<CanvasAnnotation[]>([]);
  const [crop, setCrop] = useState<CropState>({
    x: 0,
    y: 0,
    width: 1920,
    height: 1080,
    aspectRatio: 'free',
    isActive: false,
  });

  // History Stack for Undo / Redo
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      adjustments: DEFAULT_ADJUSTMENTS,
      filterPreset: 'normal',
      transform: DEFAULT_TRANSFORM,
      annotations: [],
      timestamp: Date.now(),
      actionName: 'Initial state',
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Modals & Overlays
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isAppDownloadOpen, setIsAppDownloadOpen] = useState<boolean>(false);
  const [showFpsBar, setShowFpsBar] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, description }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Google Auth lifecycle
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoggingIn(true);
      const res = await googleSignIn();
      setGoogleUser(res.user);
      setGoogleToken(res.accessToken);
      addToast('success', 'Connected with Google', `Signed in as ${res.user.displayName || res.user.email}`);
    } catch (err: any) {
      addToast('error', 'Google Sign In Failed', err?.message || 'Could not complete authentication');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await googleSignOut();
      setGoogleUser(null);
      setGoogleToken(null);
      addToast('info', 'Signed out of Google');
    } catch (err: any) {
      addToast('error', 'Sign out error', err?.message);
    }
  };

  const handleSaveToDrive = async (
    format: 'png' | 'jpeg' | 'webp',
    quality: number,
    scale: number,
    filename: string
  ) => {
    if (!activeImage) {
      addToast('error', 'No image loaded to save');
      return;
    }

    try {
      const offscreen = document.createElement('canvas');
      renderCompositionToCanvas(
        offscreen,
        activeImage,
        currentAdjustments,
        transform,
        annotations,
        crop,
        scale
      );

      const mimeType = `image/${format}`;
      const blob = await new Promise<Blob | null>((resolve) => {
        offscreen.toBlob((b) => resolve(b), mimeType, quality);
      });

      if (!blob) {
        throw new Error('Could not convert canvas to image data');
      }

      const res = await uploadImageToDrive(blob, `${filename}.${format}`, googleToken || undefined);
      addToast('success', 'Saved to Google Drive', res.name);
    } catch (err: any) {
      addToast('error', 'Save to Drive Failed', err?.message || 'Check network connection and permissions');
      throw err;
    }
  };

  // Record History State
  const recordHistory = useCallback(
    (actionName: string) => {
      const newEntry: HistoryEntry = {
        adjustments: { ...currentAdjustments },
        filterPreset: activePresetId,
        transform: { ...transform },
        annotations: [...annotations],
        crop: { ...crop },
        timestamp: Date.now(),
        actionName,
      };

      setHistory((prev) => {
        // Slice up to current index + 1 and append
        const updated = prev.slice(0, historyIndex + 1);
        return [...updated, newEntry];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [currentAdjustments, activePresetId, transform, annotations, crop, historyIndex]
  );

  // Undo / Redo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const target = history[prevIdx];
      if (target) {
        setAdjustments(target.adjustments);
        setActivePresetId(target.filterPreset);
        setTransform(target.transform);
        setAnnotations(target.annotations);
        if (target.crop) setCrop(target.crop);
        setHistoryIndex(prevIdx);
        addToast('info', 'Undo', target.actionName);
      }
    }
  }, [historyIndex, history, addToast]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const target = history[nextIdx];
      if (target) {
        setAdjustments(target.adjustments);
        setActivePresetId(target.filterPreset);
        setTransform(target.transform);
        setAnnotations(target.annotations);
        if (target.crop) setCrop(target.crop);
        setHistoryIndex(nextIdx);
        addToast('info', 'Redo', target.actionName);
      }
    }
  }, [historyIndex, history, addToast]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside text input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsExportModalOpen(true);
      } else if (e.key.toLowerCase() === 'f' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowFpsBar((prev) => !prev);
      } else if (e.key.toLowerCase() === 'm' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const isMuted = soundEffects.toggleMute();
        addToast('info', isMuted ? 'Audio Muted' : 'Audio Unmuted');
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      } else if (e.key === 'Escape') {
        setIsExportModalOpen(false);
        setIsShortcutsOpen(false);
        setIsAppDownloadOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Export Engine
  const handleExport = async (
    format: 'png' | 'jpeg' | 'webp',
    quality: number,
    scale: number,
    filename: string
  ) => {
    if (!activeImage) {
      addToast('error', 'No image loaded to export');
      return;
    }

    try {
      const offscreen = document.createElement('canvas');
      renderCompositionToCanvas(
        offscreen,
        activeImage,
        currentAdjustments,
        transform,
        annotations,
        crop,
        scale
      );

      const mimeType = `image/${format}`;
      const dataUrl = offscreen.toDataURL(mimeType, quality);

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${filename}.${format}`;
      a.click();

      addToast('success', 'Image Exported Successfully', `${offscreen.width} × ${offscreen.height} px`);
    } catch {
      addToast('error', 'Export Failed', 'Unable to create image file.');
    }
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    if (!activeImage) {
      addToast('error', 'No image loaded to copy');
      return false;
    }

    try {
      const offscreen = document.createElement('canvas');
      renderCompositionToCanvas(
        offscreen,
        activeImage,
        currentAdjustments,
        transform,
        annotations,
        crop,
        1
      );

      return new Promise<boolean>((resolve) => {
        offscreen.toBlob(async (blob) => {
          if (!blob) {
            addToast('error', 'Could not generate blob');
            resolve(false);
            return;
          }
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
            addToast('success', 'Copied Image to Clipboard');
            resolve(true);
          } catch {
            addToast('error', 'Clipboard access denied or unsupported');
            resolve(false);
          }
        }, 'image/png');
      });
    } catch {
      addToast('error', 'Clipboard copy failed');
      return false;
    }
  };

  const baseDimensions = activeImage
    ? {
        width: crop.isActive ? crop.width : activeImage.naturalWidth || activeImage.width,
        height: crop.isActive ? crop.height : activeImage.naturalHeight || activeImage.height,
      }
    : { width: 1920, height: 1080 };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans">
      {/* Top Main Navigation Header */}
      <Header
        currentWorkspace={currentWorkspace}
        onWorkspaceChange={setCurrentWorkspace}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenExport={() => setIsExportModalOpen(true)}
        onImageUploaded={(file) => setExternalImageFile(file)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        showFpsBar={showFpsBar}
        onToggleFpsBar={() => setShowFpsBar((prev) => !prev)}
        onOpenAppDownload={() => setIsAppDownloadOpen(true)}
        googleUser={googleUser}
        isLoggingIn={isLoggingIn}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
        onOpenDrivePicker={() => setIsDrivePickerOpen(true)}
      />

      {/* Main Studio Workspaces */}
      <div className="flex-1 flex overflow-hidden relative">
        {currentWorkspace === 'photo' && (
          <PhotoStudio
            onNotify={addToast}
            externalImageFile={externalImageFile}
            onClearExternalImageFile={() => setExternalImageFile(null)}
            currentAdjustments={currentAdjustments}
            setAdjustments={setAdjustments}
            activePresetId={activePresetId}
            setActivePresetId={setActivePresetId}
            transform={transform}
            setTransform={setTransform}
            annotations={annotations}
            setAnnotations={setAnnotations}
            crop={crop}
            setCrop={setCrop}
            onRecordHistory={recordHistory}
            activeImage={activeImage}
            setActiveImage={setActiveImage}
            onOpenAppDownload={() => setIsAppDownloadOpen(true)}
            onOpenAiEngine={() => setCurrentWorkspace('ai')}
          />
        )}

        {currentWorkspace === 'video' && <VideoStudio onNotify={addToast} />}

        {currentWorkspace === 'audio' && <AudioStudio onNotify={addToast} />}

        {currentWorkspace === 'ai' && (
          <AiEngineStudio
            activeImage={activeImage}
            onApplyAdjustmentsToPhoto={(newAdj) => {
              setAdjustments((prev) => ({ ...prev, ...newAdj }));
              recordHistory('Applied AI Auto-Enhance');
            }}
            onSwitchToPhotoStudio={() => setCurrentWorkspace('photo')}
            onNotify={addToast}
          />
        )}

        {currentWorkspace === 'graphics' && <GraphicStudio onNotify={addToast} />}

        {currentWorkspace === 'editorial' && <EditorialStudio onNotify={addToast} />}

        {currentWorkspace === 'palette' && (
          <PaletteLab activeImage={activeImage} onNotify={addToast} />
        )}
      </div>

      {/* Real-time Hardware Performance FPS Bar */}
      {showFpsBar && (
        <FpsBar
          canvasWidth={baseDimensions.width}
          canvasHeight={baseDimensions.height}
          onClose={() => setShowFpsBar(false)}
        />
      )}

      {/* Modals & Overlays */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        baseWidth={baseDimensions.width}
        baseHeight={baseDimensions.height}
        onExport={handleExport}
        onCopyToClipboard={handleCopyToClipboard}
        onSaveToDrive={handleSaveToDrive}
        isGoogleAuthenticated={!!googleUser}
        onGoogleSignIn={handleGoogleSignIn}
      />

      <DrivePickerModal
        isOpen={isDrivePickerOpen}
        onClose={() => setIsDrivePickerOpen(false)}
        token={googleToken}
        onSelectImage={(file) => setExternalImageFile(file)}
        onNotify={addToast}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <AppDownloadModal
        isOpen={isAppDownloadOpen}
        onClose={() => setIsAppDownloadOpen(false)}
        onNotify={addToast}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
