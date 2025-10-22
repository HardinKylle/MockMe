'use client';
import { useState } from 'react';
import { models, ModelData } from '@/configs/models'; 

export const useModelSwitcher = () => {
  const [modelIndex, setModelIndex] = useState(0);

  const switchModel = () => {
    setModelIndex((currentIndex) => (currentIndex + 1) % models.length);
  };

  const selectedModel = models[modelIndex];
  const nextModelName = models[(modelIndex + 1) % models.length].name;

  return {
    selectedModel,
    switchModel,
    nextModelName,
  };
};