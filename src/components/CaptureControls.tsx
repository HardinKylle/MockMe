'use client';
import { useState } from 'react';
import { Camera, Loader2, Check, Video, CircleStop } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/Button';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// aspect ratio options
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
  showTimeline: boolean; // Add this prop
  onToggleTimeline: () => void; // Add this prop
}

export default function CaptureControls({ onCapture, isLoading = false, aspectRatio, onAspectRatioChange, showTimeline, onToggleTimeline }: CaptureControlsProps) {
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
        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute bottom-14 right-0 mb-2 w-30 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
            {aspectRatios.map((ratio) => (
              <Button
                key={ratio.value}
                onClick={() => handleSelect(ratio.value)}
                variant="menu-item"
                size="menu-item"
                className={cn(
                  'flex justify-between items-center',
                  ratio.value === aspectRatio ? 'bg-blue-100 text-blue-700' : ''
                )}
              >
                {ratio.label}
                {ratio.value === aspectRatio && <Check size={16} />}
              </Button>
            ))}
          </div>
        )}


        {/* Main Button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          variant="secondary"
          size="default"
          isActive={isOpen}
          tooltip={!isLoading ? 'Aspect Ratio' : undefined}
          className="w-28 justify-center"
        >
          {aspectRatio}
        </Button>
      </div>
      <Button
        onClick={onToggleTimeline}
        variant="primary"
        size="default"
        tooltip="Video Animation"
        isActive={showTimeline}
      >
        {showTimeline ? (
          // Use CircleStop for the "Stop" icon
          <CircleStop className=" text-red-500" size={24} />
        ) : (
          // Use Video for the "Record" icon
          <Video size={24} />
        )}
      </Button>


      {/* Capture Button */}
      <Button
        onClick={handleCaptureClick}
        disabled={isLoading}
        variant="primary"
        size="default"
        tooltip={!isLoading ? 'Capture Image' : undefined}
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