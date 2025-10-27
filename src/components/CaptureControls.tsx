'use client';
import { useState } from 'react';
import { Camera, Loader2, Check, Video, CircleStop } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/Button';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Aspect ratio options
const aspectRatios = [
  { label: '16:9', value: '16:9' },
  { label: '9:16', value: '9:16' },
  { label: '1:1', value: '1:1' },
  { label: '4:3', value: '4:3' },
];

// Define the props interface
interface CaptureControlsProps {
  onCapture: () => void;
  isLoading?: boolean;
  aspectRatio: string;
  onAspectRatioChange: (value: string) => void;
  showTimeline: boolean;
  onToggleTimeline: () => void;
}

export default function CaptureControls({
  onCapture,
  isLoading = false,
  aspectRatio,
  onAspectRatioChange,
  showTimeline,
  onToggleTimeline,
}: CaptureControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCaptureClick = () => {
    onCapture();
  };

  const handleSelect = (value: string) => {
    onAspectRatioChange(value);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative">
        {/* --- Dropdown Menu (UI MODIFIED) --- */}
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
                  // Use 'secondary' for active, 'menu-item' for inactive
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

        {/* --- Main Button (UI MODIFIED) --- */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          variant="secondary" // This will now use our dark 'secondary' style
          size="default" // This is our 56x56 icon button
          isActive={isOpen}
          tooltip={!isLoading ? 'Aspect Ratio' : undefined}
          tooltipSide="top"
          className="w-28 justify-center rounded-full" // Changed to rounded-lg to fit text
        >
          {aspectRatio}
        </Button>
      </div>

      {/* --- Timeline Button (UI MODIFIED) --- */}
      <Button
        onClick={onToggleTimeline}
        variant="secondary" // Changed to 'secondary' to match other controls
        size="default"
        tooltip="Video Animation"
        tooltipSide="top"
        isActive={showTimeline}
      >
        {showTimeline ? (
          // Use a more standard icon, perhaps just Video with an "active" color
          <Video className="text-blue-400" size={24} />
        ) : (
          <Video size={24} />
        )}
      </Button>

      {/* --- Capture Button (UI MODIFIED) --- */}
      <Button
        onClick={handleCaptureClick}
        disabled={isLoading}
        variant="primary" // This remains 'primary' as it's a main action
        size="default"
        tooltip={!isLoading ? 'Capture Image' : undefined}
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