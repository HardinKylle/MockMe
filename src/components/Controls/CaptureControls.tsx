'use client';

// Capture controls for screenshots and video timeline

import { useState } from 'react';
import { Camera, Loader2, Video } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Aspect ratio options for download
const aspectRatios = [
  { label: '16:9', value: '16:9' },
  { label: '9:16', value: '9:16' },
  { label: '1:1', value: '1:1' },
  { label: '4:3', value: '4:3' },
];

// Props for CaptureControls component
interface CaptureControlsProps {
  onCapture: () => void; // Callback for screenshot
  isLoading?: boolean; // Loading state for capture
  aspectRatio: string; // Current aspect ratio
  onAspectRatioChange: (value: string) => void; // Handler for aspect ratio change
  showTimeline: boolean; // Show/hide timeline
  onToggleTimeline: () => void; // Handler for toggling timeline
}

export default function CaptureControls({
  onCapture,
  isLoading = false,
  aspectRatio,
  onAspectRatioChange,
  showTimeline,
  onToggleTimeline,
}: CaptureControlsProps) {
  // Dropdown open/close state
  const [isOpen, setIsOpen] = useState(false);

  // Handle screenshot button click
  const handleCaptureClick = () => {
    onCapture();
  };

  // Handle aspect ratio selection
  const handleSelect = (value: string) => {
    onAspectRatioChange(value);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative">
        {/* Aspect Ratio Dropdown */}
        {isOpen && (
          <div
            className="absolute bottom-full right-0 mb-2 w-32 rounded-lg border shadow-xl bg-linear-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 backdrop-blur-xl z-20 p-1.5"
            style={{ animation: 'slideUp 0.2s ease-out' }}
          >
            <style>{`
              @keyframes slideUp {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            <div className="space-y-1">
              {aspectRatios.map((ratio) => (
                <Button
                  key={ratio.value}
                  onClick={() => handleSelect(ratio.value)}
                  variant={
                    ratio.value === aspectRatio ? 'secondary' : 'menu-item'
                  }
                  size="menu-item"
                  className="w-full"
                >
                  {ratio.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Aspect Ratio Button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          variant="secondary"
          size="default"
          isActive={isOpen}
          tooltip={!isLoading ? 'Aspect Ratio' : undefined}
          tooltipSide="top"
          className="w-28 justify-center rounded-full"
        >
          {aspectRatio}
        </Button>
      </div>

      {/* Timeline Toggle Button */}
      <Button
        onClick={onToggleTimeline}
        variant="secondary"
        size="default"
        tooltip="Video Animation"
        tooltipSide="top"
        isActive={showTimeline}
      >
        {showTimeline ? (
          <Video className="text-blue-400" size={24} />
        ) : (
          <Video size={24} />
        )}
      </Button>

      {/* Screenshot Capture Button */}
      <Button
        onClick={handleCaptureClick}
        disabled={isLoading}
        variant="primary"
        size="default"
        tooltip={!isLoading ? 'Screenshot' : undefined}
        tooltipSide="top"
      >
        {isLoading ? (
          <Loader2 size={24} className="animate-spin" />
        ) : (
          <Camera size={24} />
        )}
      </Button>
    </>
  );
}