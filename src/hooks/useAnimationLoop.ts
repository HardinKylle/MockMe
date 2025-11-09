'use client';

import { useRef, RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { type OrbitControls as OrbitControlsType } from 'three-stdlib';
import { useAnimation } from '@/contexts/AnimationContext';
import { SceneState } from '@/types/animation';
import { presetAnimationMap, isPresetAnim } from '@/types/animation-presets';


// Easing function for animation progress
const easeInOutCubic = (t: number) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// Shared vectors for interpolation
const startPos = new THREE.Vector3();
const endPos = new THREE.Vector3();
const startTarget = new THREE.Vector3();
const endTarget = new THREE.Vector3();
const startModelPos = new THREE.Vector3();
const endModelPos = new THREE.Vector3();
const startModelRot = new THREE.Vector3();
const endModelRot = new THREE.Vector3();

// Cartesian <-> Spherical helpers for camera animation
const cartesianToSpherical = (vec: THREE.Vector3) => {
  const radius = vec.length();
  const theta = Math.atan2(vec.x, vec.z);
  const phi = Math.acos(vec.y / radius);
  return { radius, theta, phi };
};
const sphericalToCartesian = (radius: number, theta: number, phi: number) => {
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.cos(theta)
  );
};
const shortestAngleDelta = (start: number, end: number) => {
  let delta = end - start;
  while (delta > Math.PI) delta -= 2 * Math.PI;
  while (delta < -Math.PI) delta += 2 * Math.PI;
  return delta;
};
const lerp = (start: number, end: number, t: number) => {
  return start + (end - start) * t;
};

interface UseAnimationLoopProps {
  modelRef: RefObject<THREE.Group | null>;
  controlsRef: RefObject<OrbitControlsType | null>;
  onLiveCameraChange: (newState: SceneState) => void;
}

export const useAnimationLoop = ({
  modelRef,
  controlsRef,
  onLiveCameraChange,
}: UseAnimationLoopProps) => {
  const { camera } = useThree();

  const {
    animationScenes: scenes,
    totalVideoDuration,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    setHasFinished,
    isScrubbing,
  } = useAnimation();

  useFrame((state, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    let videoJustFinished = false;
    // Advance time if playing
    if (isPlaying) {
      const frameDelta = delta;
      setCurrentTime((prevTime) => {
        const newTime = prevTime + frameDelta;
        if (newTime >= totalVideoDuration) {
          setIsPlaying(false);
          setHasFinished(true);
          videoJustFinished = true;
          return totalVideoDuration;
        }
        return newTime;
      });
    }

    // Sync state on last frame
    if (videoJustFinished) {
      const pos = camera.position.toArray() as [number, number, number];
      const target = controls.target.toArray() as [number, number, number];
      if (modelRef.current) {
        onLiveCameraChange({
          position: pos,
          target: target,
          fov: camera instanceof THREE.PerspectiveCamera ? camera.fov : 50,
          modelPosition: modelRef.current.position.toArray() as [number, number, number],
          modelRotation: [modelRef.current.rotation.x, modelRef.current.rotation.y, modelRef.current.rotation.z],
          modelScale: modelRef.current.scale.x,
        });
      }
    }

    // Animate camera/model if playing or scrubbing
    if (isPlaying || isScrubbing) {
      let timeSoFar = 0;
      let sceneFound = false;

      for (const scene of scenes) {
        const sceneStartTime = timeSoFar;
        const sceneEndTime = sceneStartTime + scene.duration;

        if (currentTime >= sceneStartTime && currentTime <= sceneEndTime) {
          sceneFound = true;
          const timeInScene = currentTime - sceneStartTime;
          const sceneProgress = scene.duration > 0 ? timeInScene / scene.duration : 0;
          const easedProgress = easeInOutCubic(sceneProgress);

          if (modelRef.current && controls) {
            if (isPresetAnim(scene.animationType)) {
              // Apply base state from startView before preset animation
              if (scene.startView && modelRef.current && controls) {
                camera.position.set(...scene.startView.position);
                (controls as OrbitControlsType).target.set(...scene.startView.target);
                if (camera instanceof THREE.PerspectiveCamera) {
                  camera.fov = scene.startView.fov;
                  camera.updateProjectionMatrix();
                }
                modelRef.current.position.set(...scene.startView.modelPosition);
                modelRef.current.rotation.set(...scene.startView.modelRotation);
                modelRef.current.scale.set(scene.startView.modelScale, scene.startView.modelScale, scene.startView.modelScale);
                (controls as OrbitControlsType).update();
              }
              const animFn = presetAnimationMap[scene.animationType];
              if (animFn) {
                animFn({
                  camera,
                  controls: controls as OrbitControlsType,
                  modelRef,
                  sceneProgress,
                  easedProgress,
                });
              }
            }
            else if (scene.animationType === 'custom') {
              if (scene.startView && scene.endView) {
                // Camera position/target interpolation
                startPos.set(...scene.startView.position);
                endPos.set(...scene.endView.position);
                startTarget.set(...scene.startView.target);
                endTarget.set(...scene.endView.target);

                // Spherical interpolation for orbital movement
                const startSphere = cartesianToSpherical(startPos);
                const endSphere = cartesianToSpherical(endPos);
                const angleDiff = Math.abs(shortestAngleDelta(startSphere.theta, endSphere.theta));
                const shouldUseSpherical = angleDiff > Math.PI / 2;

                if (shouldUseSpherical) {
                  const interpolatedRadius = lerp(startSphere.radius, endSphere.radius, easedProgress);
                  const thetaDelta = shortestAngleDelta(startSphere.theta, endSphere.theta);
                  const interpolatedTheta = startSphere.theta + thetaDelta * easedProgress;
                  const interpolatedPhi = lerp(startSphere.phi, endSphere.phi, easedProgress);
                  const interpolatedPos = sphericalToCartesian(
                    interpolatedRadius,
                    interpolatedTheta,
                    interpolatedPhi
                  );
                  camera.position.copy(interpolatedPos);
                } else {
                  startPos.lerp(endPos, easedProgress);
                  camera.position.copy(startPos);
                }

                startTarget.lerp(endTarget, easedProgress);
                (controls as OrbitControlsType).target.copy(startTarget);
                (controls as OrbitControlsType).update();

                // FOV interpolation
                const startFov = scene.startView.fov;
                const endFov = scene.endView.fov;
                if (camera instanceof THREE.PerspectiveCamera) {
                  camera.fov = lerp(startFov, endFov, easedProgress);
                  camera.updateProjectionMatrix();
                }
                // Model position/rotation/scale interpolation
                startModelPos.set(...scene.startView.modelPosition);
                endModelPos.set(...scene.endView.modelPosition);
                startModelPos.lerp(endModelPos, easedProgress);
                modelRef.current.position.copy(startModelPos);

                startModelRot.set(...scene.startView.modelRotation);
                endModelRot.set(...scene.endView.modelRotation);
                startModelRot.lerp(endModelRot, easedProgress);
                modelRef.current.rotation.set(startModelRot.x, startModelRot.y, startModelRot.z);

                const startScale = scene.startView.modelScale;
                const endScale = scene.endView.modelScale;
                const newScale = lerp(startScale, endScale, easedProgress);
                modelRef.current.scale.set(newScale, newScale, newScale);
              }
            }
            else if (scene.animationType === 'hold') {
              if (scene.startView) {
                camera.position.set(...scene.startView.position);
                (controls as OrbitControlsType).target.set(...scene.startView.target);
                if (camera instanceof THREE.PerspectiveCamera) {
                  camera.fov = scene.startView.fov;
                  camera.updateProjectionMatrix();
                }
                modelRef.current.position.set(...scene.startView.modelPosition);
                modelRef.current.rotation.set(...scene.startView.modelRotation);
                modelRef.current.scale.set(scene.startView.modelScale, scene.startView.modelScale, scene.startView.modelScale);
              } else {
                camera.position.set(0, 0, 2);
                (controls as OrbitControlsType).target.set(0, 0, 0);
              }
              (controls as OrbitControlsType).update();
            }
          }
          break;
        }
        timeSoFar = sceneEndTime;
      }

      // Sync live camera/model state
      const pos = camera.position.toArray() as [number, number, number];
      const target = controls.target.toArray() as [number, number, number];
      if (modelRef.current) {
        onLiveCameraChange({
          position: pos,
          target: target,
          fov: camera instanceof THREE.PerspectiveCamera ? camera.fov : 50,
          modelPosition: modelRef.current.position.toArray() as [number, number, number],
          modelRotation: [modelRef.current.rotation.x, modelRef.current.rotation.y, modelRef.current.rotation.z],
          modelScale: modelRef.current.scale.x,
        });
      }
    }
  });
};