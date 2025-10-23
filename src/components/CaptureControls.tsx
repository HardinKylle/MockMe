'use client';
import { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react'; 
import { Button, buttonVariants } from '@/components/ui/Button';
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
  onCapture: (aspectRatio: string) => void;
  isLoading?: boolean;
}

export default function CaptureControls({ onCapture, isLoading = false }: CaptureControlsProps) {
  const [aspectRatio, setAspectRatio] = useState(aspectRatios[0].value);

  const handleCaptureClick = () => {
    onCapture(aspectRatio);
  };

 return (
    <>
      {/* Aspect Ratio Selector */}
      <div className="relative group">
        <select
          id="aspect-ratio"
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value)}
          disabled={isLoading}
          className={cn(
            buttonVariants({ variant: 'secondary', size: 'default' }),
            'appearance-none', 
            'pr-12' 
          )}
        >
          {aspectRatios.map((ratio) => (
            <option key={ratio.value} value={ratio.value}>
              {ratio.label}
            </option>
          ))}
        </select>
        {/* Custom arrow for the select */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
        </div>

        {!isLoading && (
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-2 text-sm text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            Aspect Ratio
          </span>
        )}
      </div>

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