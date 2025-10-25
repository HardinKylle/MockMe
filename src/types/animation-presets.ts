import { Camera } from '@react-three/fiber';
import * as THREE from 'three';
import { RefObject } from 'react';
import { AnimationType, PresetAnimationType } from '@/types/animation';

/**
 * Defines the properties passed to every preset animation function
 * on each frame.
 */
export interface PresetAnimationProps {
  camera: Camera;
  controls: any;
  modelRef: RefObject<THREE.Group | null>;
  sceneProgress: number; // linear progress from 0 to 1
  easedProgress: number; // eased progress from 0 to 1
}

// --- Helper for lerping ---
// We use this in the new presets
const lerp = THREE.MathUtils.lerp;

// --- Type Guards ---

const presetTypes: PresetAnimationType[] = [
  'spin',
  'dolly-pan-up', // <-- Added
  'reveal-from-top', // <-- Added
];

/**
 * Checks if a given animation type is a preset animation.
 */
export const isPresetAnim = (
  type: AnimationType
): type is PresetAnimationType => {
  return presetTypes.includes(type as any);
};

// --- Preset Animation Logic ---

/**
 * SPIN: Rotates the model 360 degrees on its Y-axis.
 * Camera remains stationary.
 */
const spin: (props: PresetAnimationProps) => void = ({
  camera,
  controls,
  modelRef,
  sceneProgress,
}) => {
  // Set stationary camera view
  camera.position.set(0, 0, 2);
  controls.target.set(0, 0, 0);
  controls.update();

  // Rotate the model
  if (modelRef.current) {
    const targetRotation = sceneProgress * (2 * Math.PI);
    modelRef.current.rotation.y = targetRotation;
  }
};

/**
 * NEW: DOLLY-PAN-UP
 * Starts low, moves up and slightly forward, tilting camera up.
 */
const dollyPanUp: (props: PresetAnimationProps) => void = ({
  camera,
  controls,
  modelRef,
  easedProgress,
}) => {
  // Start position (low, further away)
  const startX = 0;
  const startY = -1;
  const startZ = 2.5;

  // End position (eye-level, closer)
  const endX = 0;
  const endY = 0;
  const endZ = 2;

  // Interpolate camera position
  camera.position.set(
    lerp(startX, endX, easedProgress),
    lerp(startY, endY, easedProgress),
    lerp(startZ, endZ, easedProgress)
  );

  // Start target (looking up at the model)
  const targetStartY = 0.2;
  // End target (looking straight at the model)
  const targetEndY = 0;

  // Interpolate camera target
  controls.target.set(
    0,
    lerp(targetStartY, targetEndY, easedProgress),
    0
  );
  controls.update();

  // Ensure model is not spinning
  if (modelRef.current) {
    modelRef.current.rotation.y = 0;
  }
};

/**
 * NEW: REVEAL-FROM-TOP
 * Starts directly above the model and swoops down to a front-on view.
 */
const revealFromTop: (props: PresetAnimationProps) => void = ({
  camera,
  controls,
  modelRef,
  easedProgress,
}) => {
  // Start position (high above)
  const startX = 0;
  const startY = 3;
  const startZ = 0.1; // Sightly in front to avoid gimbal lock

  // End position (standard hero shot)
  const endX = 0;
  const endY = 0;
  const endZ = 2;

  // Interpolate camera position
  camera.position.set(
    lerp(startX, endX, easedProgress),
    lerp(startY, endY, easedProgress),
    lerp(startZ, endZ, easedProgress)
  );

  // Always look at the center
  controls.target.set(0, 0, 0);
  controls.update();

  // Ensure model is not spinning
  if (modelRef.current) {
    modelRef.current.rotation.y = 0;
  }
};

// --- EXPORT MAP ---

/**
 * A map connecting preset animation names (from animation.ts)
 * to their corresponding logic functions.
 */
export const presetAnimationMap: Record<
  PresetAnimationType,
  (props: PresetAnimationProps) => void
> = {
  spin,
  'dolly-pan-up': dollyPanUp, // <-- Added
  'reveal-from-top': revealFromTop, // <-- Added
};