// src/components/CaptureControls.tsx
'use client';
import { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react'; // Icons to match your style

// Define the aspect ratio options
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
      {/* Aspect Ratio Selector - Styled as a "pill" to fit in */}
      <div className="relative group">
        <select
          id="aspect-ratio"
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value)}
          disabled={isLoading}
          className="bg-white text-gray-900 p-4 rounded-full shadow-lg border border-gray-200 transform  hover:scale-105 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200"
          style={{ paddingRight: '3rem' }} // Add space for the arrow
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
      </div>

      <div className="relative group">
        <button
          onClick={handleCaptureClick}
          disabled={isLoading}
          className="bg-blue-950 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:bg-blue-900 transform transition-all duration-200 hover:scale-105 disabled:bg-gray-400 disabled:scale-100 disabled:shadow-lg disabled:cursor-not-allowed"
          title="Capture Image"
        >
          {isLoading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <Camera size={24} />
          )}
        </button>
        {/* Tooltip */}
        {!isLoading && (
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-2 text-sm text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Capture Image
          </span>
        )}
      </div>
    </>
  );
}