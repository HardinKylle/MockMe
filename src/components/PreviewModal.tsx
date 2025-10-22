'use client';
import { useState } from 'react';
import { X, Download, Check, Sparkles } from 'lucide-react';

interface PreviewModalProps {
    imageUrl: string;
    onClose: () => void;
}

export default function PreviewModal({ imageUrl, onClose }: PreviewModalProps) {
    const [includeBackground, setIncludeBackground] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloaded, setDownloaded] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        await new Promise(resolve => setTimeout(resolve, 400));

        const link = document.createElement('a');
        link.download = 'mockme-capture.png';

        if (includeBackground) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;

                if (ctx) {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                ctx?.drawImage(img, 0, 0);
                link.href = canvas.toDataURL('image/png');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setIsDownloading(false);
                setDownloaded(true);
                setTimeout(() => setDownloaded(false), 2000);
            };

            img.src = imageUrl;
        } else {
            link.href = imageUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setIsDownloading(false);
            setDownloaded(true);
            setTimeout(() => setDownloaded(false), 2000);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
      style={{
        background: 'rgba(0, 0, 0, 0.1)' // Light backdrop
      }}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-3xl relative overflow-hidden"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)', // Lighter shadow, subtle border
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <style>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.96);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>

        {/* Header with ambient glow */}
        <div className="relative px-8 pt-8 pb-6">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-500/10 blur-2xl rounded-full" />

          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-semibold text-neutral-900">
                  Preview Mockup
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 transition-all duration-200 flex items-center justify-center border border-neutral-200"
              title="Close"
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="px-8 pb-8">
          {/* Premium Image Preview */}
          <div className="relative mb-6 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-30 blur transition-opacity duration-500" />
            <div className="relative rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100">
              <div className="max-h-[60vh] flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt="Capture preview"
                  className="max-w-full max-h-[60vh] w-auto h-auto object-contain"
                />
              </div>
            </div>
          </div>

          {/* Options card */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-md border-2 transition-all duration-300 flex items-center justify-center cursor-pointer ${
                    includeBackground
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-transparent'
                      : 'border-neutral-400 hover:border-neutral-500 bg-white'
                  }`}
                  onClick={() => setIncludeBackground(!includeBackground)}
                >
                  {includeBackground && (
                    <Check size={14} className="text-white" strokeWidth={3} />
                  )}
                </div>
                <div>
                  <label
                    htmlFor="bg-toggle"
                    className="text-sm font-medium text-neutral-800 cursor-pointer"
                    onClick={() => setIncludeBackground(!includeBackground)}
                  >
                    Include Background
                  </label>
                </div>
              </div>

              <div
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  includeBackground
                    ? 'bg-blue-100 text-blue-600 border border-blue-200'
                    : 'bg-neutral-200 text-neutral-600 border border-neutral-300'
                }`}
              >
                {includeBackground ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-12 rounded-xl font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 hover:border-neutral-300 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading || downloaded}
              className="flex-1 h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 relative overflow-hidden group shadow-lg shadow-blue-500/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              {downloaded ? (
                <>
                  <Check size={20} strokeWidth={2.5} />
                  Downloaded
                </>
              ) : isDownloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Downloading
                </>
              ) : (
                <>
                  <Download size={20} strokeWidth={2.5} />
                  Download PNG
                </>
              )}
            </button>
          </div>

          {/* Subtle info text */}
          <p className="text-center text-xs text-neutral-500 mt-4">
            High quality PNG · {includeBackground ? 'With background' : 'Transparent'}
          </p>
        </div>
      </div>
    </div>
  );
}