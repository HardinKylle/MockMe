'use client';

// Provides global state and reducer for camera/model controls in the 3D scene.

import { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import { SceneState } from '@/types/animation';

// Default scene controls values
export const DEFAULT_SCENE_CONTROLS = {
  cameraPosition: [0, 0, 2] as [number, number, number],
  cameraTarget: [0, 0, 0] as [number, number, number],
  cameraFov: 50,
  modelPosition: [0, 0, 0] as [number, number, number],
  modelRotation: [0, 0, 0] as [number, number, number],
  modelScale: 1,
  ambientIntensity: 0.7,
  directionalIntensity: 0.1,
  directionalPosition: [2, 3, 4] as [number, number, number],
  environmentIntensity: 0.2,
  screenReflection: true,
};

export type SceneControlState = typeof DEFAULT_SCENE_CONTROLS;

// This maps `position` to `cameraPosition`, etc.
type ViewState = SceneState;

type SceneControlAction =
  | { type: 'RESET' }
  | { type: 'SET_VIEW'; payload: ViewState } // Handles mapping from types
  | {
      type: 'SET_PRESET';
      payload: { position: [number, number, number]; target: [number, number, number] };
    }
  | { type: 'UPDATE_RAW'; payload: Partial<SceneControlState> }; // For direct slider updates

// Reducer for scene controls state
const sceneControlsReducer = (
  state: SceneControlState,
  action: SceneControlAction
): SceneControlState => {
  switch (action.type) {
    case 'RESET':
      return DEFAULT_SCENE_CONTROLS;

    case 'SET_VIEW':
      const { position, target, fov, modelPosition, modelRotation, modelScale } =
        action.payload;
      return {
        ...state,
        cameraPosition: position,
        cameraTarget: target,
        cameraFov: fov,
        modelPosition: modelPosition,
        modelRotation: modelRotation,
        modelScale: modelScale,
      };

    case 'SET_PRESET':
      return {
        ...state,
        cameraPosition: action.payload.position,
        cameraTarget: action.payload.target,
        modelPosition: DEFAULT_SCENE_CONTROLS.modelPosition,
        modelRotation: DEFAULT_SCENE_CONTROLS.modelRotation,
        modelScale: DEFAULT_SCENE_CONTROLS.modelScale,
      };

    case 'UPDATE_RAW':
      return { ...state, ...action.payload };

    default:
      return state;
  }
};

interface SceneContextType {
  sceneControls: SceneControlState;
  dispatchSceneControls: Dispatch<SceneControlAction>;
}

const SceneContext = createContext<SceneContextType | null>(null);

export const SceneProvider = ({ children }: { children: ReactNode }) => {
  const [sceneControls, dispatchSceneControls] = useReducer(
    sceneControlsReducer,
    DEFAULT_SCENE_CONTROLS
  );

  return (
    <SceneContext.Provider value={{ sceneControls, dispatchSceneControls }}>
      {children}
    </SceneContext.Provider>
  );
};

export const useScene = () => {
  const context = useContext(SceneContext);
  if (!context) {
    throw new Error('useScene must be used within a SceneProvider');
  }
  return context;
};