'use client';
import { useState } from 'react';
import { Smartphone, ChevronUp } from 'lucide-react';
import { ModelData } from '@/configs/models';
import { Button } from '@/components/ui/Button';

interface ModelSelectorProps {
  allModels: ModelData[];
  selectedModel: ModelData;
  onModelSelect: (modelName: string) => void;
}

export default function ModelSelector({
  allModels,
  selectedModel,
  onModelSelect,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (modelName: string) => {
    onModelSelect(modelName);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* --- Dropdown Menu (UI MODIFIED) --- */}
      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-48 rounded-lg border shadow-xl bg-linear-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 backdrop-blur-xl z-20 p-1.5"
          style={{ animation: 'slideUp 0.2s ease-out' }}
        >
          <style>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <div className="space-y-1" role="menu">
            {allModels.map((model) => (
              <Button
                key={model.name}
                onClick={() => handleSelect(model.name)}
                // Use secondary variant for active, menu-item (now dark) for others
                variant={
                  model.name === selectedModel.name
                    ? 'secondary'
                    : 'menu-item'
                }
                size="menu-item" // Use the menu-item size
                className="w-full"
                role="menuitem"
              >
                {model.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* This button already uses our dark 'secondary' variant, so it's consistent */}
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