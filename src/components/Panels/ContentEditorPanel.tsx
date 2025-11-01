'use client';

// Panel for editing the total video/content duration

import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { TimerIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAnimation } from '@/contexts/AnimationContext';

// Props for ContentEditorPanel
interface ContentEditorPanelProps {
  isVisible: boolean; // Show/hide panel
}

// Minimum allowed content duration
const MIN_DURATION = 1;

export default function ContentEditorPanel({
  isVisible,
}: ContentEditorPanelProps) {
  // Get total duration and setter from animation context
  const { totalVideoDuration, setTotalVideoDuration } = useAnimation();
  // Local state for input value
  const [inputValue, setInputValue] = useState(totalVideoDuration.toString());

  // Sync input value when total video duration changes
  useEffect(() => {
    setInputValue(totalVideoDuration.toString());
  }, [totalVideoDuration]);

  // Handle input change
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    const parsedVal = parseFloat(val);
    if (!isNaN(parsedVal) && parsedVal > 0) {
      setTotalVideoDuration(parsedVal);
    }
  };

  // Validate and update duration on blur
  const handleOnBlur = () => {
    const parsedVal = parseFloat(inputValue);
    if (isNaN(parsedVal) || parsedVal < MIN_DURATION) {
      setTotalVideoDuration(MIN_DURATION);
      setInputValue(MIN_DURATION.toString());
    } else {
      setTotalVideoDuration(parsedVal);
    }
  };

  // Hide panel if not visible
  if (!isVisible) return null;

  return (
    <div
      className={`z-20 w-60 rounded-lg border shadow-xl bg-linear-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 backdrop-blur-xl transition-all duration-300 ease-out ${isVisible
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <TimerIcon className="h-3.5 w-3.5 text-slate-400" />
          <h3 className="text-sm font-medium text-slate-100">
            Total Duration
          </h3>
        </div>
      </div>

      {/* Form */}
      <div className="p-3 space-y-3">
        {/* Duration input */}
        <div className="space-y-1.5">
          <Label htmlFor="total-duration" className="text-xs">
            Duration (s)
          </Label>
          <Input
            id="total-duration"
            type="number"
            step="0.1"
            min={MIN_DURATION}
            value={inputValue}
            onChange={handleOnChange}
            onBlur={handleOnBlur}
          />
        </div>
      </div>
    </div>
  );
}