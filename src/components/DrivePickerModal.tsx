import React, { useState, useEffect } from 'react';
import { X, Cloud, RefreshCw, Download, Check, AlertCircle, FileImage, ExternalLink } from 'lucide-react';
import { listDriveFiles, downloadDriveFileBlob, DriveFileItem } from '../services/drive';

interface DrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  onSelectImage: (file: File) => void;
  onNotify: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const DrivePickerModal: React.FC<DrivePickerModalProps> = ({
  isOpen,
  onClose,
  token,
  onSelectImage,
  onNotify,
}) => {
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const items = await listDriveFiles(token);
      setFiles(items);
    } catch (err: any) {
      setError(err?.message || 'Could not load files from Google Drive');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && token) {
      fetchFiles();
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleChoose = async (item: DriveFileItem) => {
    try {
      setDownloadingId(item.id);
      const blob = await downloadDriveFileBlob(item.id, token || undefined);
      const file = new File([blob], item.name, { type: blob.type || 'image/png' });
      onSelectImage(file);
      onNotify('success', 'Loaded from Google Drive', item.name);
      onClose();
    } catch (err: any) {
      onNotify('error', 'Failed to import from Drive', err?.message);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden text-neutral-100 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-sky-400" />
            <h3 className="font-semibold text-sm">Import from Google Drive</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={fetchFiles}
              disabled={loading}
              className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
              title="Refresh files"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          {loading && files.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 text-rose-500 animate-spin" />
              <span>Scanning Google Drive files...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Google Drive Notice</p>
                <p className="mt-0.5 text-neutral-400">{error}</p>
                <button
                  onClick={fetchFiles}
                  className="mt-2 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded font-medium"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : files.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400 flex flex-col items-center justify-center gap-2">
              <FileImage className="w-8 h-8 text-neutral-600" />
              <p className="text-neutral-300 font-medium">No Drive files found yet</p>
              <p className="text-neutral-500 max-w-xs text-[11px]">
                Files created by Lumen or opened through Google Drive will appear here. You can also export your current studio project directly to Google Drive.
              </p>
            </div>
          ) : (
            files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-800/80 bg-neutral-950/60 hover:bg-neutral-800/50 hover:border-neutral-700 transition-colors gap-3"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {file.thumbnailLink ? (
                    <img
                      src={file.thumbnailLink}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded-lg border border-neutral-800 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 text-neutral-500">
                      <FileImage className="w-4 h-4" />
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-xs font-medium text-neutral-200 truncate">{file.name}</p>
                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5 truncate">
                      {file.mimeType.replace('image/', '').toUpperCase()}
                      {file.modifiedTime ? ` · ${new Date(file.modifiedTime).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {file.webViewLink && (
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-neutral-400 hover:text-white rounded"
                      title="Open in Google Drive"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => handleChoose(file)}
                    disabled={downloadingId === file.id}
                    className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    {downloadingId === file.id ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3" />
                        <span>Open</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-neutral-950 border-t border-neutral-800 text-[11px] text-neutral-500 flex justify-between items-center shrink-0">
          <span>Connected via Google Drive API</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
