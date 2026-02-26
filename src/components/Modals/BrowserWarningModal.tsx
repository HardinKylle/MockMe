'use client'

// Modal warning for unsupported browser video export

import { Button } from '@/components/ui/Button';

// Props for BrowserWarningModal
interface BrowserWarningModalProps {
    onClose: () => void; // Callback to close modal
}

// Modal component to inform user about browser limitations
export const BrowserWarningModal = ({ onClose }: BrowserWarningModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-lg border shadow-xl p-6 space-y-4 bg-linear-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50"
        style={{ animation: 'slideUp 0.2s ease-out' }}
      >
        <h3 className="text-xl font-semibold text-white">
          Browser Not Supported
        </h3>
        <p className="text-slate-300">
          Unfortunately, your browser does not support the required video
          codec (<code>video/webm; codecs=vp9</code>) for exporting this
          animation.
        </p>
        <p className="text-slate-300">
          Please try again using a different browser like{' '}
          <strong className="text-white">Google Chrome</strong> or{' '}
          <strong className="text-white">Microsoft Edge</strong> for full
          export functionality.
        </p>
        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={onClose}>
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
};