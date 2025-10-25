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

export interface AnimationScene {
  id: string;
  name: string;
  duration: number;
  animationType: AnimationType; // <-- This is now updated
  startView?: CameraView;
  endView?: CameraView;
}

export type CameraView = {
  position: [number, number, number];
  target: [number, number, number];
};