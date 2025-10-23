'use client';
import { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

interface PickerProps {
  color: string;
  onChange: (color: string) => void;
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
      return '#000000'; // Default to black for contrast
    }
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  const checkerboardStyle = {
    backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
    backgroundSize: '8px 8px',
    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 border border-gray-200  flex items-center justify-center"
        title="Change background color"
        style={{
          backgroundColor: color,
          ...(color === 'transparent' && checkerboardStyle)
        }}
      >
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
        <Palette
          size={24}
          className="relative z-10 transition-transform duration-200 group-hover:rotate-12"
          style={{ color: getContrastColor(color) }}
        />
      </button>

      {isOpen && (
        <div
          ref={pickerRef}
          className="absolute bottom-20 right-0 w-72 bg-white rounded-2xl shadow-2xl overflow-hidden z-20 border border-gray-100"
          style={{ animation: 'slideUp 0.2s ease-out' }}
        >
          <style>{`
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>

          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Pick a color</h3>

            {/* Color Preview & Hex Input */}
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm shrink-0"
                style={{
                  backgroundColor: color,
                  ...(color === 'transparent' && checkerboardStyle)
                }}
              />
              <div className="flex-1">
                <label className="text-xs text-gray-500 block mb-1">Hex Code</label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border text-gray-900 border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                  placeholder="#000000"
                  maxLength={7}
                />
              </div>
            </div>
          </div>

          {/* Color Picker */}
          <div className="p-4">
            <HexColorPicker
              color={color === 'transparent' ? '#FFFFFF' : color} // HexColorPicker can't handle 'transparent'
              onChange={handleColorChange}
              className="w-full shadow-none!"
              style={{ height: '180px' }}
            />
          </div>

          {/* Preset Colors */}
          <div className="px-4 pb-4">
            <h4 className="text-xs font-medium text-gray-500 mb-2">Preset Colors</h4>
            <div className="grid grid-cols-9 gap-2">
              <button
                key="transparent"
                className="relative w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 hover:shadow-md active:scale-95"
                style={{
                  ...checkerboardStyle,
                  borderColor: color === 'transparent' ? '#3b82f6' : '#e5e7eb'
                }}
                onClick={() => handleColorChange('transparent')}
                title="Transparent"
              >
                {color === 'transparent' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check size={14} style={{ color: '#000000' }} strokeWidth={3} />
                  </div>
                )}
              </button>

              {presetColors.map((preset) => (
                <button
                  key={preset}
                  className="relative w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 hover:shadow-md active:scale-95"
                  style={{
                    backgroundColor: preset,
                    borderColor: color === preset ? '#3b82f6' : '#e5e7eb'
                  }}
                  onClick={() => handleColorChange(preset)}
                  title={preset}
                >
                  {color === preset && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check size={14} style={{ color: getContrastColor(preset) }} strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}