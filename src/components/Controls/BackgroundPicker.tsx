'use client';
import { useState, useRef, useEffect } from 'react';
import { Palette, Check, Pipette } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input'; 
import { Label } from '@/components/ui/Label'; 
import { cn } from '@/lib/utils'; 

interface PickerProps {
  color: string;
  onChange: (color: string) => void;
}

interface EyeDropperResult {
  sRGBHex: string;
}

interface EyeDropper {
  open: () => Promise<EyeDropperResult>;
}

interface EyeDropperConstructor {
  new (): EyeDropper;
}
const presetColors = [
  '#FFFFFF',
  '#9e9e9e',
  '#333333',
  '#f44336',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',
  '#2196f3',
  '#03a9f4',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#8bc34a',
  '#cddc39',
  '#ffeb3b',
  '#ffc107',
  '#ff9800',
];

export default function BackgroundColorPicker({ color, onChange }: PickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(color);
  const pickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setInputValue(color);
  }, [color]);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleColorChange = (newColor: string) => {
    onChange(newColor);
    setInputValue(newColor);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      onChange(value);
    }
  };

  const getContrastColor = (hexColor: string) => {
    if (hexColor === 'transparent') {
      return '#000000';
    }
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  const checkerboardStyle = {
    backgroundImage:
      'linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)',
    backgroundSize: '8px 8px',
    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
  };

  const openEyeDropper = async () => {
    const eyeDropperApi = (
      window as Window & { EyeDropper?: EyeDropperConstructor }
    ).EyeDropper;

    if (!eyeDropperApi) {
      alert("Your browser doesn't support the EyeDropper API.");
      return;
    }

    try {
      const eyeDropper = new eyeDropperApi();
      const { sRGBHex } = await eyeDropper.open();
      handleColorChange(sRGBHex);
      setIsOpen(false);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.warn(`EyeDropper cancelled or failed: ${e.message}`);
      } else {
        console.warn('EyeDropper cancelled or failed:', e);
      }
    }
  };

  return (
    <div className="relative">
      {/* This button is already consistent */}
      <Button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        variant="secondary"
        size="default"
        tooltip="Background Color"
        tooltipSide="bottom"
        isActive={isOpen}
        style={{
          backgroundColor: color === 'transparent' ? undefined : color,
          ...(color === 'transparent' && checkerboardStyle),
        }}
      >
        <Palette
          size={24}
          className="relative z-10 transition-transform duration-200 group-hover:rotate-12"
          style={{ color: getContrastColor(color) }}
        />
      </Button>

      {isOpen && (
        <div
          ref={pickerRef}
          // --- UI MODIFIED: Dark panel styles ---
          className="absolute top-full mt-2 right-0 w-72 rounded-lg border shadow-xl bg-linear-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 backdrop-blur-xl z-20 overflow-hidden"
          style={{ animation: 'slideUp 0.2s ease-out' }}
        >
          {/* --- UI MODIFIED: Dark theme for react-colorful --- */}
          <style>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .react-colorful {
              --colorful-bg-hsl: 240, 10%, 15%;
              --colorful-border-hsl: 240, 10%, 30%;
              --colorful-label-hsl: 240, 10%, 80%;
              --colorful-pointer-hsl: 240, 10%, 80%;
              border-radius: 0;
              border: none;
            }
            .react-colorful__saturation {
              border: 1px solid var(--colorful-border-hsl);
              border-radius: 0.375rem; /* rounded-md */
            }
            .react-colorful__hue, .react-colorful__alpha {
              border-radius: 0.375rem; /* rounded-md */
              height: 12px;
            }
            .react-colorful__saturation-pointer, 
            .react-colorful__hue-pointer, 
            .react-colorful__alpha-pointer {
              width: 16px;
              height: 16px;
              border-width: 2px;
            }
          `}</style>

          {/* Header */}
          <div className="px-4 pt-3 pb-3 border-b border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-100">
                Pick a color
              </h3>
              <Button
                type="button"
                onClick={openEyeDropper}
                variant="ghost"
                size="sm" // Consistent icon button size
                tooltip="Use Eyedropper"
                tooltipSide="left"
              >
                <Pipette size={16} />
              </Button>
            </div>

            {/* Color Preview & Hex Input */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-md border border-slate-700/50 shadow-sm shrink-0"
                style={{
                  backgroundColor: color,
                  ...(color === 'transparent' && checkerboardStyle),
                }}
              />
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="hex-input" className="text-xs">
                  Hex Code
                </Label>
                <Input
                  id="hex-input"
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  className="font-mono uppercase"
                  placeholder="#000000"
                  maxLength={7}
                />
              </div>
            </div>
          </div>

          {/* Color Picker */}
          <div className="p-4 pt-3">
            <HexColorPicker
              color={color === 'transparent' ? '#FFFFFF' : color}
              onChange={handleColorChange}
              className="w-full shadow-none!"
              style={{ height: '160px' }}
            />
          </div>

          {/* Transparent & Preset Colors */}
          <div className="px-4 pb-4 space-y-3">
            <Button
              onClick={() => handleColorChange('transparent')}
              variant={color === 'transparent' ? 'secondary' : 'ghost'}
              size="md"
              className="w-full relative"
              style={checkerboardStyle}
            >

              {color === 'transparent' && (
                <Check
                  size={16}
                  strokeWidth={3}
                  className="absolute left-3 z-10 text-slate-800"
                />
              )}
            </Button>

            <h4 className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">
              Presets
            </h4>
            <div className="grid grid-cols-9 gap-2">
              {presetColors.map((preset) => (
                <button
                  key={preset}
                  className={cn(
                    'relative w-full aspect-square rounded-md border transition-all hover:scale-110 hover:shadow-md active:scale-95',
                    color === preset
                      ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900'
                      : 'border-slate-700/50'
                  )}
                  style={{
                    backgroundColor: preset,
                  }}
                  onClick={() => handleColorChange(preset)}
                  title={preset}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}