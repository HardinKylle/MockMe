'use client';

// Hook for switching between available 3D device models.

import { useState, useCallback } from 'react';
import { models, ModelData } from '@/configs/models'; 

export function useModelSwitcher() {
  // Set the default model
  const [selectedModel, setSelectedModel] = useState<ModelData>(models[0]);

  // New function to set the model by its name
  const setModel = useCallback((modelName: string) => {
    const newModel = models.find(m => m.name === modelName);
    if (newModel) {
      setSelectedModel(newModel);
    }
  }, []);

  // Return the new setter and the full models array
  return {
    selectedModel,
    setModel,
    allModels: models 
  };
}