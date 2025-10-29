// src/contexts/AppContext.tsx
'use client';

import { ReactNode } from 'react';
import { SceneProvider } from './SceneContext';
import { AnimationProvider } from './AnimationContext';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SceneProvider>
      <AnimationProvider>{children}</AnimationProvider>
    </SceneProvider>
  );
};