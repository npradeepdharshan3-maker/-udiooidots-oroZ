import React, { useState } from 'react';
import {
  Download,
  Share,
  PlusSquare,
  CheckCircle2,
  Smartphone,
  Laptop,
  X,
  ExternalLink,
  Layers,
  Sparkles,
  Zap,
  QrCode,
  Copy,
  Check,
  Cloud,
  FileText,
  Globe,
} from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { soundEffects } from '../utils/soundEffects';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({
  isOpen,
  onClose,
  onNotify,
}) => {
  const { isInstalled, isIOS, isAndroid, canPromptNative, promptInstall } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'overview' | 'mediafire' | 'ios' | 'android' | 'desktop'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMediafireNote, setCopiedMediafireNote] = useState(false);

  if (!isOpen) return null;

  const currentAppUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleNativeInstall = async () => {
    soundEffects.playStamp();
    const outcome = await promptInstall();
    if (outcome === 'accepted') {
      if (onNotify) {
        onNotify('success', 'Installation Started', 'Zoro. Studio is being added to your device!');
      }
      onClose();
    } else if (outcome === 'manual') {
      if (isIOS) {
        setActiveTab('ios');
      } else if (isAndroid) {
        setActiveTab('android');
      } else {
        setActiveTab('desktop');
      }
    }
  };

  const handleCopyAppUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentAppUrl);
      setCopiedLink(true);
      soundEffects.playSuccess();
      if (onNotify) {
        onNotify('success', 'App Link Copied', 'Share or open in your mobile browser to install');
      }
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-100 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800/80 bg-gradient-to-r from-neutral-900 via-rose-950/20 to-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20 p-2">
              <img src="/icon.svg" alt="Zoro Studio Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 font-display">
                Download Zoro. Studio App
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  PWA / Standalone
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Install as a full native-feel app on iPhone, iPad, Android, or PC/Mac
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/60 px-4 pt-2 gap-1 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-rose-500 text-rose-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Install</span>
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ios'
                ? 'border-rose-500 text-rose-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iOS / Safari</span>
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'android'
                ? 'border-rose-500 text-rose-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android / Chrome</span>
          </button>
          <button
            onClick={() => setActiveTab('desktop')}
            className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'desktop'
                ? 'border-rose-500 text-rose-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Desktop (Mac / Win)</span>
          </button>
          <button
            onClick={() => setActiveTab('mediafire')}
            className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'mediafire'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-blue-400" />
            <span>MediaFire / Cloud</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[68vh] overflow-y-auto">
          {isInstalled && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-emerald-300">App Already Installed</p>
                <p className="text-[11px] text-neutral-400">
                  You are running or have Zoro. Studio installed on this device.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold">
                    <Zap className="w-4 h-4" />
                    <span>Instant Launch</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Launches straight from your home screen or dock without browser chrome.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold">
                    <Layers className="w-4 h-4" />
                    <span>Full Offline Canvas</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Local GPU-accelerated canvas filter pipeline, EXIF reader & CapCut text engine.
                  </p>
                </div>
              </div>

              {/* Direct Install CTA */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-800/80 to-neutral-900 border border-neutral-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">One-Click App Download</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {canPromptNative
                      ? 'Ready to install on this device right now'
                      : 'Click to trigger browser install or view platform instructions'}
                  </p>
                </div>

                <button
                  onClick={handleNativeInstall}
                  className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{canPromptNative ? 'Install Zoro. App Now' : 'Download / Add App'}</span>
                </button>
              </div>

              {/* App Shareable Link & QR Code Box */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-semibold text-white">Scan with Camera or Copy App Link</span>
                  </div>
                  {copiedLink && <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1"><Check className="w-3 h-3" /> Copied!</span>}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* QR Code preview generated via lightweight quickchart API */}
                  <div className="w-24 h-24 p-1.5 bg-white rounded-xl shadow shrink-0 flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(currentAppUrl)}&color=09090b`}
                      alt="Scan to open on phone"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Point your iPhone Camera or Android QR scanner at the code to instantly launch the studio on your mobile device.
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={currentAppUrl}
                        className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-neutral-300 focus:outline-none select-all"
                      />
                      <button
                        onClick={handleCopyAppUrl}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 active:scale-95 border border-neutral-700 rounded-lg text-xs font-medium text-white transition-colors flex items-center gap-1.5 shrink-0"
                        title="Copy App URL"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                      </button>
                      <a
                        href={currentAppUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-neutral-800 hover:bg-neutral-700 active:scale-95 border border-neutral-700 rounded-lg text-neutral-300 hover:text-white transition-colors shrink-0"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mediafire' && (
            <div className="space-y-4 text-xs text-neutral-300">
              {/* Mediafire Info Header */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-neutral-900 to-neutral-950 border border-blue-500/30 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                  <Cloud className="w-4 h-4 text-blue-400" />
                  <span>MediaFire & Cloud App Package</span>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  Zoro. Photo Studio is a standalone Progressive Web App (PWA). You can launch it directly from the live URL below, or package its desktop/mobile shortcut file to upload and share on <strong>MediaFire</strong>, <strong>Google Drive</strong>, or your cloud storage.
                </p>
              </div>

              {/* Direct Live App URL */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    Live App Launch URL (Share on MediaFire / Forums)
                  </span>
                  {copiedLink && (
                    <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" /> Copied!
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentAppUrl}
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-neutral-300 focus:outline-none select-all"
                  />
                  <button
                    onClick={handleCopyAppUrl}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-medium rounded-lg text-xs transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy URL'}</span>
                  </button>
                </div>
              </div>

              {/* Download App Shortcut File for Mediafire Upload */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-white">Generate Zoro App Launcher (.url / .html file)</span>
                  </div>
                </div>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Download an offline web launcher shortcut that can be zipped and uploaded directly to <strong>MediaFire</strong>. When users download it from MediaFire and double-click, it immediately opens Zoro. Studio in standalone full-screen mode!
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      soundEffects.playStamp();
                      const content = `[InternetShortcut]\nURL=${currentAppUrl}\nIconIndex=0\n`;
                      const blob = new Blob([content], { type: 'text/plain' });
                      const a = document.createElement('a');
                      a.href = URL.createObjectURL(blob);
                      a.download = 'Zoro-Photo-Studio.url';
                      a.click();
                      if (onNotify) {
                        onNotify('success', 'Shortcut Downloaded', 'Zoro-Photo-Studio.url is ready to upload to MediaFire!');
                      }
                    }}
                    className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 active:scale-95 border border-neutral-700 rounded-lg text-xs font-medium text-white transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>Download Windows Shortcut (.url)</span>
                  </button>

                  <button
                    onClick={() => {
                      soundEffects.playStamp();
                      const content = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Zoro. Studio Launcher</title><meta http-equiv="refresh" content="0; url=${currentAppUrl}"></head><body style="background:#09090b;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;"><p>Launching Zoro. Photo Studio... <a href="${currentAppUrl}" style="color:#f43f5e">Click here</a> if not redirected.</p><script>window.location.href="${currentAppUrl}";</script></body></html>`;
                      const blob = new Blob([content], { type: 'text/html' });
                      const a = document.createElement('a');
                      a.href = URL.createObjectURL(blob);
                      a.download = 'Zoro-Photo-Studio.html';
                      a.click();
                      if (onNotify) {
                        onNotify('success', 'HTML Launcher Downloaded', 'Zoro-Photo-Studio.html ready for MediaFire!');
                      }
                    }}
                    className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 active:scale-95 border border-neutral-700 rounded-lg text-xs font-medium text-white transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download Cross-Platform Launcher (.html)</span>
                  </button>
                </div>
              </div>

              {/* Mediafire Quick Upload Instructions */}
              <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                <span className="font-semibold text-neutral-200 block text-xs">
                  How to host on MediaFire:
                </span>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-neutral-400 leading-relaxed">
                  <li>Download the <strong>Zoro-Photo-Studio launcher file</strong> above (or zip it).</li>
                  <li>Go to <a href="https://www.mediafire.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">MediaFire.com</a> and log in or upload as guest.</li>
                  <li>Click <strong>Upload Files</strong> and select the launcher file or zip.</li>
                  <li>Copy your generated MediaFire sharing link to distribute to anyone!</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-3.5 text-xs text-neutral-300">
              <p className="text-neutral-400">
                On iPhone and iPad, Apple requires adding the app via the Safari share menu:
              </p>
              <ol className="space-y-2.5">
                <li className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <span className="font-semibold text-white">Open in Safari</span>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Ensure you are using the Safari browser on iOS (Chrome on iOS redirects to Safari).
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="flex-1">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      Tap the Share Button <Share className="w-3.5 h-3.5 text-blue-400 inline" />
                    </span>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Tap the box with an arrow pointing upward in Safari's bottom toolbar.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      Select "Add to Home Screen" <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" />
                    </span>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Scroll down in the share sheet, tap "Add to Home Screen", then tap "Add" in the top right.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-3.5 text-xs text-neutral-300">
              <p className="text-neutral-400">
                Install directly using Google Chrome or Samsung Internet on Android:
              </p>
              <ol className="space-y-2.5">
                <li className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <span className="font-semibold text-white">Tap Install App Prompt</span>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Tap the "Install Zoro. App" button above, or the banner at the bottom of Chrome.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <span className="font-semibold text-white">Or Open Chrome Menu (⋮)</span>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Tap the three dots in the top-right corner and choose "Install app" or "Add to Home screen".
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'desktop' && (
            <div className="space-y-3.5 text-xs text-neutral-300">
              <p className="text-neutral-400">
                Install as a native desktop application on Chrome, Brave, or Edge:
              </p>
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Laptop className="w-4 h-4 text-rose-400" />
                  <span>Browser Address Bar Icon</span>
                </div>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Look for the <strong>Install</strong> icon (computer monitor with a down arrow, or plus sign) on the far right of your browser's address bar. Click it and select <strong>Install</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800/80 bg-neutral-950/80 flex items-center justify-between text-xs">
          <span className="text-neutral-500 font-mono text-[11px]">
            Zoro. Studio v2.4 PWA Ready
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleNativeInstall}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
