// These are the animations you can configure with camera views
export type CustomAnimationType = 'hold' | 'custom';

// These are pre-programmed animations.
// Added new creative presets
export type PresetAnimationType =
  | 'spin'
  | 'dolly-pan-up'
  | 'reveal-from-top';

// The main type is now a union of the two.
export type AnimationType = CustomAnimationType | PresetAnimationType;

// --- RENAMED and EXPANDED this type ---
export type SceneState = {
  // Camera
  position: [number, number, number];
  target: [number, number, number];
  fov: number; // <-- ADDED
  
  // Model
  modelPosition: [number, number, number]; // <-- ADDED
  modelRotation: [number, number, number]; // <-- ADDED
  modelScale: number; // <-- ADDED
};

export interface AnimationScene {
  id: string;
  name: string;
  duration: number;
  animationType: AnimationType; 
  // --- UPDATED to use the new type ---
  startView?: SceneState;
  endView?: SceneState;
}

// --- This type is no longer needed, but you can keep it as an alias
// if other files use it, or remove it.
// export type CameraView = {
//   position: [number, number, number];
//   target: [number, number, number];
// };