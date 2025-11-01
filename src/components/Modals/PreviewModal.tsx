'use client';

// Modal for previewing and downloading captured mockup images

import { useState } from 'react';
import { X, Download, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Props for PreviewModal
interface PreviewModalProps {
  imageUrl: string; // URL of the image to preview
  onClose: () => void; // Callback to close modal
}

export default function PreviewModal({ imageUrl, onClose }: PreviewModalProps) {
  // Download state management
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Handle image download as PNG
  const handleDownload = async () => {
    setIsDownloading(true);
    await new Promise((resolve) => setTimeout(resolve, 400)); // Simulate download delay

    const link = document.createElement('a');
    link.download = 'mockme-capture.png';
    link.href = imageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsDownloading(false);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000); // Show "Downloaded" state briefly
  };

  // Close modal when clicking backdrop (outside panel)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      onClick={handleBackdropClick}
      style={{
        background: 'rgba(2, 6, 23, 0.7)', // Dark backdrop (slate-900/70)
      }}
    >
      <div
        className="w-full max-w-3xl relative rounded-lg border shadow-xl bg-linear-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 backdrop-blur-xl"
        style={{
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Slide up animation for modal */}
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

        {/* Header with close button */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-slate-100">
              Mockup Preview
            </h3>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4"
            >
              <X size={18} strokeWidth={2.5} />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Image Preview */}
          <div className="relative mb-6 group">
            <div className="relative rounded-lg overflow-hidden border border-slate-700/50 bg-slate-800/50">
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
              variant="secondary"
              size="full"
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isDownloading || downloaded}
              variant="primary"
              size="full"
              className="gap-2"
            >
              {downloaded ? (
                <>
                  <Check size={20} strokeWidth={2.5} />
                  Downloaded
                </>
              ) : isDownloading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Downloading
                </>
              ) : (
                <>
                  <Download size={20} strokeWidth={2.5} />
                  Download PNG
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}