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
      {/* --- Dropdown Menu --- */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 mb-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu">
            {allModels.map((model) => (
              <button
                key={model.name}
                onClick={() => handleSelect(model.name)}
                className={`flex items-center w-full text-left px-4 py-2 text-sm ${model.name === selectedModel.name
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
                role="menuitem"
              >
                {model.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="primary"
        size="default"
        tooltip="Switch Model"
        className="gap-2" 
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