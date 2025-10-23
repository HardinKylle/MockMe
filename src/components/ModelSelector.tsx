'use client';
import { useState } from 'react';
import { Smartphone, ChevronUp } from 'lucide-react';
import { ModelData } from '@/configs/models'; // Import the type

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
                className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                  model.name === selectedModel.name
                    ? 'bg-blue-100 text-blue-700' // Highlight selected
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

      {/* --- Main Button --- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-950 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:bg-blue-900 transform transition-all duration-200 hover:scale-105 flex items-center gap-2"
        title="Switch device"
      >
        <Smartphone size={24} />
        {/* Arrow to show open/closed state */}
        <ChevronUp
          size={16}
          className={`transition-transform ${isOpen ? 'rotate-0' : 'rotate-180'}`}
        />
      </button>
    </div>
  );
}