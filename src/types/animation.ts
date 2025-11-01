export type CustomAnimationType = 'hold' | 'custom';


export type PresetAnimationType =
  | 'spin'
  | 'dolly-pan-up'
  | 'reveal-from-top';

export type AnimationType = CustomAnimationType | PresetAnimationType;

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

export interface AnimationScene {
  id: string;
  name: string;
  duration: number;
  animationType: AnimationType; 
  startView?: SceneState;
  endView?: SceneState;
}

