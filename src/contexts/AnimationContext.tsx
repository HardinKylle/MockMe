'use client';

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, } from 'react';
import { AnimationScene, SceneState } from '@/types/animation';
import { DEFAULT_SCENE_CONTROLS } from './SceneContext';

const generateId = () => `scene_${Math.random().toString(36).substr(2, 9)}`;
const DEFAULT_TOTAL_DURATION = 10;

const getCurrentSceneState = (): AnimationScene['startView'] => ({
  position: DEFAULT_SCENE_CONTROLS.cameraPosition,
  target: DEFAULT_SCENE_CONTROLS.cameraTarget,
  fov: DEFAULT_SCENE_CONTROLS.cameraFov,
  modelPosition: DEFAULT_SCENE_CONTROLS.modelPosition,
  modelRotation: DEFAULT_SCENE_CONTROLS.modelRotation,
  modelScale: DEFAULT_SCENE_CONTROLS.modelScale,
});

const defaultScene: AnimationScene = {
  id: generateId(),
  name: 'Default Spin',
  duration: 3,
  animationType: 'spin',
  startView: getCurrentSceneState(),
};

interface AnimationContextType {
  animationScenes: AnimationScene[];
  setAnimationScenes: Dispatch<SetStateAction<AnimationScene[]>>;
  selectedSceneId: string | null;
  setSelectedSceneId: Dispatch<SetStateAction<string | null>>;
  totalVideoDuration: number;
  setTotalVideoDuration: Dispatch<SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  currentTime: number;
  setCurrentTime: Dispatch<SetStateAction<number>>;
  hasFinished: boolean;
  setHasFinished: Dispatch<SetStateAction<boolean>>;
  isScrubbing: boolean;
  setIsScrubbing: Dispatch<SetStateAction<boolean>>;
  handleAddScene: (currentState: SceneState) => void;
}

const AnimationContext = createContext<AnimationContextType | null>(null);

export const AnimationProvider = ({ children }: { children: ReactNode }) => {
  const [animationScenes, setAnimationScenes] = useState<AnimationScene[]>([
    defaultScene,
  ]);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(
    defaultScene.id
  );
  const [totalVideoDuration, setTotalVideoDuration] = useState(
    DEFAULT_TOTAL_DURATION
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasFinished, setHasFinished] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);

  //handler of adding
  const handleAddScene = (currentState: SceneState) => {
    const newScene: AnimationScene = {
      id: `scene_${Math.random().toString(36).substr(2, 9)}`,
      name: `Scene ${animationScenes.length + 1}`,
      duration: 3,
      animationType: 'hold',
      startView: currentState,
    };
    setAnimationScenes([...animationScenes, newScene]);
    setSelectedSceneId(newScene.id);
  };

  return (
    <AnimationContext.Provider
      value={{
        animationScenes,
        setAnimationScenes,
        selectedSceneId,
        setSelectedSceneId,
        totalVideoDuration,
        setTotalVideoDuration,
        isPlaying,
        setIsPlaying,
        currentTime,
        setCurrentTime,
        hasFinished,
        setHasFinished,
        isScrubbing,
        setIsScrubbing,
        handleAddScene
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};