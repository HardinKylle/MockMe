'use client';

// Provides global state for animation scenes, timeline, playback, and scene management.

import { createContext, useContext, useState, useRef, useCallback, MutableRefObject, ReactNode, Dispatch, SetStateAction } from 'react';
import { AnimationScene, SceneState } from '@/types/animation';
import { DEFAULT_SCENE_CONTROLS } from './SceneContext';

// Helper to generate unique scene IDs
const generateId = () => `scene_${Math.random().toString(36).substr(2, 9)}`;

// Default total video duration (seconds)
export const DEFAULT_TOTAL_DURATION = 10;

// Returns the current default scene state
const getCurrentSceneState = (): AnimationScene['startView'] => ({
  position: DEFAULT_SCENE_CONTROLS.cameraPosition,
  target: DEFAULT_SCENE_CONTROLS.cameraTarget,
  fov: DEFAULT_SCENE_CONTROLS.cameraFov,
  modelPosition: DEFAULT_SCENE_CONTROLS.modelPosition,
  modelRotation: DEFAULT_SCENE_CONTROLS.modelRotation,
  modelScale: DEFAULT_SCENE_CONTROLS.modelScale,
});

// Default initial scene
export const defaultScene: AnimationScene = {
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
  isRecordingRef: MutableRefObject<boolean>;
  isExporting: boolean;
  setIsExporting: (value: boolean) => void;
  isExportingRef: MutableRefObject<boolean>;
  exportTimeRef: MutableRefObject<number>;
  exportVideoRef: MutableRefObject<HTMLVideoElement | null>;
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
  // Ref so useFrame can read recording state synchronously (not stale from closure)
  const isRecordingRef = useRef(false);

  // Export state: both React state (for re-renders) and ref (for useFrame access)
  const [isExporting, setIsExportingState] = useState(false);
  const isExportingRef = useRef(false);
  const exportTimeRef = useRef(0);
  // Shared ref to the screen video element so the export loop can seek + await
  const exportVideoRef = useRef<HTMLVideoElement | null>(null);
  const setIsExporting = useCallback((value: boolean) => {
    setIsExportingState(value);
    isExportingRef.current = value;
  }, []);

  // Adds a new scene to the timeline using the current camera/model state
  const handleAddScene = (currentState: SceneState) => {
    const newScene: AnimationScene = {
      id: generateId(),
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
        isRecordingRef,
        isExporting,
        setIsExporting,
        isExportingRef,
        exportTimeRef,
        exportVideoRef,
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
