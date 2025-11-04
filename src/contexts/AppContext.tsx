'use client';

import { ReactNode } from 'react';
import { SceneProvider } from './SceneContext';
import { AnimationProvider } from './AnimationContext';
import { AssetProvider } from './AssetContext';
import { AuthProvider } from './AuthContext';
import { ModalProvider } from './ModalContext';
import { ProjectProvider } from './ProjectContext';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      <ModalProvider>
        <SceneProvider>
          <AnimationProvider>
            <AssetProvider>
              <ProjectProvider>{children}</ProjectProvider>
            </AssetProvider>
          </AnimationProvider>
        </SceneProvider>
      </ModalProvider>
    </AuthProvider>
  );
};