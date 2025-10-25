'use client';

import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { TimerIcon } from 'lucide-react';
import { useState, useEffect } from 'react'; // Import hooks

interface ContentEditorPanelProps {
  isVisible: boolean;
  totalVideoDuration: number;
  setTotalVideoDuration: (duration: number) => void;
}

const MIN_DURATION = 1; // Set a minimum duration

export default function ContentEditorPanel({
  isVisible,
  totalVideoDuration,
  setTotalVideoDuration,
}: ContentEditorPanelProps) {
  // Local state to hold the string value of the input
  const [inputValue, setInputValue] = useState(totalVideoDuration.toString());

  // Keep local state in sync with parent prop
  useEffect(() => {
    setInputValue(totalVideoDuration.toString());
  }, [totalVideoDuration]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow user to type empty string, "1.", etc.
    setInputValue(val);

    const parsedVal = parseFloat(val);
    // If it's a valid number, update the parent state immediately
    if (!isNaN(parsedVal) && parsedVal > 0) {
      setTotalVideoDuration(parsedVal);
    }
  };

  const handleOnBlur = () => {
    const parsedVal = parseFloat(inputValue);
    // If the value is invalid or empty when user clicks away,
    // reset it to the minimum duration.
    if (isNaN(parsedVal) || parsedVal < MIN_DURATION) {
      setTotalVideoDuration(MIN_DURATION);
      setInputValue(MIN_DURATION.toString());
    } else {
      // Otherwise, just make sure the parent is set
      setTotalVideoDuration(parsedVal);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 left-68 z-20 w-48 rounded-lg border shadow-xl bg-linear-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 backdrop-blur-xl transition-all duration-300 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
    >
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
        {/* Duration */}
        <div className="space-y-1.5">
          <Label htmlFor="total-duration">Duration (s)</Label>
          <Input
            id="total-duration"
            type="number"
            step="0.1"
            min={MIN_DURATION} // Use min duration
            value={inputValue} // Use local string state
            onChange={handleOnChange} // Use new handler
            onBlur={handleOnBlur} // Add blur handler for validation
          />
        </div>
      </div>
    </div>
  );
}