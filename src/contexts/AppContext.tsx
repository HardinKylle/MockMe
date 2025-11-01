'use client';

import { ReactNode } from 'react';
import { SceneProvider } from './SceneContext';
import { AnimationProvider } from './AnimationContext';
import { AssetProvider } from './AssetContext';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SceneProvider>
      <AnimationProvider>
        <AssetProvider>{children}</AssetProvider> 
      </AnimationProvider>
    </SceneProvider>
  );
};