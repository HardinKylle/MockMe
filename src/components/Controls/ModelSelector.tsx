'use client';

// Model selector dropdown for switching between available models

import { useState } from 'react';
import { Smartphone, ChevronUp } from 'lucide-react';
import { ModelData } from '@/configs/models';
import { Button } from '@/components/ui/Button';

// Props for ModelSelector component
interface ModelSelectorProps {
  allModels: ModelData[]; // List of all available models
  selectedModel: ModelData; // Currently selected model
  onModelSelect: (modelName: string) => void; // Handler for model selection
}

export default function ModelSelector({
  allModels,
  selectedModel,
  onModelSelect,
}: ModelSelectorProps) {
  // State for dropdown open/close
  const [isOpen, setIsOpen] = useState(false);

  // Handle model selection from dropdown
  const handleSelect = (modelName: string) => {
    onModelSelect(modelName);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Dropdown menu for model selection */}
      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-48 rounded-lg border shadow-xl bg-linear-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 backdrop-blur-xl z-20 p-1.5"
          style={{ animation: 'slideUp 0.2s ease-out' }}
        >
          <div className="space-y-1" role="menu">
            {allModels.map((model) => (
              <Button
                key={model.name}
                onClick={() => handleSelect(model.name)}
                // Highlight selected model
                variant={
                  model.name === selectedModel.name
                    ? 'secondary'
                    : 'menu-item'
                }
                size="menu-item"
                className="w-full"
                role="menuitem"
              >
                {model.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Button to open/close model dropdown */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="secondary"
        size="default"
        tooltip="Switch Model"
        className="gap-2"
        isActive={isOpen}
        tooltipSide="bottom"
      >
        <Smartphone size={24} />
        <ChevronUp
          size={16}
          className={`transition-transform ${isOpen ? 'rotate-0' : 'rotate-180'}`}
        />
      </Button>
    </div>
  );
}