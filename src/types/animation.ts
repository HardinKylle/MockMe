// Types for animation scenes, camera/model state, and animation categories.

export type CustomAnimationType = 'hold' | 'custom';

export type PresetAnimationType =
  | 'spin'
  | 'dolly-pan-up'
  | 'reveal-from-top';

export type AnimationType = CustomAnimationType | PresetAnimationType;

// SceneState: Describes camera and model state for a scene
export type SceneState = {
  // Camera
  position: [number, number, number];
  target: [number, number, number];
  fov: number; 
  
  // Model
  modelPosition: [number, number, number]; 
  modelRotation: [number, number, number]; 
  modelScale: number; 
};

// AnimationScene: Represents a timeline scene with animation type and camera/model views
export interface AnimationScene {
  id: string;
  name: string;
  duration: number;
  animationType: AnimationType; 
  startView?: SceneState;
  endView?: SceneState;
}