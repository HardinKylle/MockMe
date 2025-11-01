'use client';

import { ReactNode } from 'react';
import { SceneProvider } from './SceneContext';
import { AnimationProvider } from './AnimationContext';
import { AssetProvider } from './AssetContext';
import { AuthProvider } from './AuthContext';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider> {/* <-- 2. WRAP ALL OTHERS */}
      <SceneProvider>
        <AnimationProvider>
          <AssetProvider>{children}</AssetProvider>
        </AnimationProvider>
      </SceneProvider>
    </AuthProvider>
  );
};