'use client';
import { useState } from 'react';
import { X, Download, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PreviewModalProps {
  imageUrl: string;
  onClose: () => void;
}

export default function PreviewModal({ imageUrl, onClose }: PreviewModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    await new Promise(resolve => setTimeout(resolve, 400));

    const link = document.createElement('a');
    link.download = 'mockme-capture.png';
    link.href = imageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsDownloading(false);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
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
                  Mockup Preview
                </h3>
              </div>
            </div>

            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="absolute right-2" // Use absolute positioning
            >
              <X size={20} strokeWidth={2} />
            </Button>
          </div>
        </div>

        <div className="px-8 pb-8">
          {/* Premium Image Preview */}
          <div className="relative mb-6 group">
            <div className="absolute -inset-1 bg-blue-500 rounded-2xl opacity-20 group-hover:opacity-30 blur transition-opacity duration-500" />
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

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="secondary" // Use the white button style
              size="full"
              className="rounded-full" // This is now handled by the base style
            >
              Cancel
            </Button>

            <button
              onClick={handleDownload}
              disabled={isDownloading || downloaded}
              className="flex-1 h-12 rounded-full font-semibold text-white bg-blue-950 flex items-center justify-center gap-2 relative overflow-hidden group shadow-lg hover:shadow-xl hover:bg-blue-900 transform transition-all duration-200 hover:scale-105"
            >
              <div className="absolute inset-0" />
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
        </div>
      </div>
    </div>
  );
}