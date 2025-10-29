'use client';
import { forwardRef, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import PhoneModel from '@/components/PhoneModel';
import * as THREE from 'three';
import { SceneCaptureController } from './SceneCaptureController';
import { ModelData, models } from '@/configs/models';
import { type OrbitControls as OrbitControlsType } from 'three-stdlib';
import { AnimationScene, SceneState, AnimationType } from '@/types/animation';
import { presetAnimationMap, isPresetAnim } from '@/types/animation-presets';

interface SceneProps {
  textureUrl: string | null;
  uploadedFileType: 'image' | 'video' | null;
  model: ModelData;
  backgroundColor: string;
  isRecording: boolean
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  isScrubbing: boolean;
  scenes: AnimationScene[];
  currentTime: number;
  setCurrentTime: (time: number | ((prevTime: number) => number)) => void;
  totalVideoDuration: number;
  setHasFinished: (hasFinished: boolean) => void;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  cameraFov: number;
  modelPosition: [number, number, number];
  modelRotation: [number, number, number];
  modelScale: number;
  ambientIntensity: number;
  directionalIntensity: number;
  directionalPosition: [number, number, number];
  environmentIntensity: number;
  screenReflection: boolean;
  // --- ADD THIS PROP ---
  onLiveCameraChange: (newState: SceneState) => void;
}

export interface SceneApi {
  capture: (aspectRatio: string) => string | undefined;
  setView: (position: readonly [number, number, number], target: readonly [number, number, number]) => void;
  getView: () => SceneState | null;
  startRecording: (aspectRatio: string) => void;
  stopRecording: () => void;
}

models.forEach(model => useGLTF.preload(model.path));

const easeInOutCubic = (t: number) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const startPos = new THREE.Vector3();
const endPos = new THREE.Vector3();
const startTarget = new THREE.Vector3();
const endTarget = new THREE.Vector3();

// --- Add these near your other THREE.Vector3 definitions ---
const startModelPos = new THREE.Vector3();
const endModelPos = new THREE.Vector3();
const startModelRot = new THREE.Vector3();
const endModelRot = new THREE.Vector3();

// Helper function to convert Cartesian to Spherical coordinates
const cartesianToSpherical = (vec: THREE.Vector3) => {
  const radius = vec.length();
  const theta = Math.atan2(vec.x, vec.z); // Horizontal angle
  const phi = Math.acos(vec.y / radius); // Vertical angle
  return { radius, theta, phi };
};

// Helper function to convert Spherical to Cartesian coordinates
const sphericalToCartesian = (radius: number, theta: number, phi: number) => {
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.cos(theta)
  );
};

// Helper to find shortest angle between two angles
const shortestAngleDelta = (start: number, end: number) => {
  let delta = end - start;
  // Normalize to [-PI, PI]
  while (delta > Math.PI) delta -= 2 * Math.PI;
  while (delta < -Math.PI) delta += 2 * Math.PI;
  return delta;
};

// Linear interpolation helper
const lerp = (start: number, end: number, t: number) => {
  return start + (end - start) * t;
};

// --- CREATE A REUSABLE VECTOR FOR THE EFFECT ---
const vec3 = new THREE.Vector3();

function SceneContent({
  backgroundColor,
  model,
  textureUrl,
  uploadedFileType,
  isPlaying,
  setIsPlaying,
  isRecording,
  isScrubbing,
  scenes,
  currentTime,
  setCurrentTime,
  totalVideoDuration,
  setHasFinished,
  cameraPosition,
  cameraTarget,
  cameraFov,
  modelPosition,
  modelRotation,
  modelScale,
  ambientIntensity,
  directionalIntensity,
  directionalPosition,
  environmentIntensity,
  screenReflection,
  // --- ADD THIS PROP ---
  onLiveCameraChange,
}: Omit<SceneProps, 'backgroundColor' | 'isScrubbing'> & {
  backgroundColor: string;
  isScrubbing: boolean;
  // --- ADD THIS PROP ---
}) {
  const { gl, camera, controls } = useThree(); // <--- GET CONTROLS FROM USETHREE
  const modelRef = useRef<THREE.Group>(null);

  // --- CAST CONTROLS TO THE CORRECT TYPE ---
  const controlsRef = useRef<OrbitControlsType>(controls as OrbitControlsType);
  // Sync ref if `controls` from `useThree` changes
  useEffect(() => {
    controlsRef.current = controls as OrbitControlsType;
  }, [controls]);


  // Apply camera FOV
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = cameraFov;
      camera.updateProjectionMatrix();
    }
  }, [camera, cameraFov]);

  // --- [FIX 1: Sliders -> Camera] ---
  // This effect applies the inspection state (from sliders) to the camera
  // ONLY when we are PAUSED.
  useEffect(() => {
    if (controlsRef.current && !isPlaying && !isScrubbing) {
      const camPos = controlsRef.current.object.position;
      const targetPos = controlsRef.current.target;

      // Check if different to prevent infinite loops from floating point noise
      if (
        !camPos.equals(vec3.set(...cameraPosition)) ||
        !targetPos.equals(vec3.set(...cameraTarget))
      ) {
        camPos.set(...cameraPosition);
        targetPos.set(...cameraTarget);
        controlsRef.current.update();
      }
    }
    // This effect runs when the *props* change, or when we pause/play
  }, [isPlaying, isScrubbing, cameraPosition, cameraTarget]);


  // Apply model transforms
  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.position.set(...modelPosition);
      modelRef.current.rotation.set(...modelRotation);
      modelRef.current.scale.set(modelScale, modelScale, modelScale);
    }
  }, [modelPosition, modelRotation, modelScale]);

  useEffect(() => {
    if (backgroundColor === 'transparent') {
      gl.setClearAlpha(0);
    } else {
      gl.setClearAlpha(1);
      gl.setClearColor(new THREE.Color(backgroundColor));
    }
  }, [gl, backgroundColor]);

  useFrame((state, delta) => {
    const controls = controlsRef.current; // Get controls from ref
    if (!controls) return; // Safety check

    // 1. Advance time ONLY if isPlaying is true
    if (isPlaying) {

      const frameDelta = delta;

      setCurrentTime((prevTime) => {
        const newTime = prevTime + frameDelta;

        if (newTime >= totalVideoDuration) {
          setIsPlaying(false);
          setHasFinished(true);

          // --- FIX: Also sync state on the very last frame ---
          const pos = camera.position.toArray() as [number, number, number];
          const target = controls.target.toArray() as [number, number, number];
          // --- UPDATED to pass full state ---
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
          // --- END FIX ---

          return totalVideoDuration;
        }
        return newTime;
      });
    }

    // 2. Animate camera/model ONLY if playing OR scrubbing
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
            // --- ALL YOUR ANIMATION LOGIC MOVES THE CAMERA ---
            if (isPresetAnim(scene.animationType)) {
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
                // --- Camera Position/Target (existing logic) ---
                startPos.set(...scene.startView.position);
                endPos.set(...scene.endView.position);
                startTarget.set(...scene.startView.target);
                endTarget.set(...scene.endView.target);

                // Convert to spherical coordinates
                const startSphere = cartesianToSpherical(startPos);
                const endSphere = cartesianToSpherical(endPos);

                // Check if positions are on opposite sides (angle difference > 90°)
                const angleDiff = Math.abs(shortestAngleDelta(startSphere.theta, endSphere.theta));
                const shouldUseSpherical = angleDiff > Math.PI / 2;

                if (shouldUseSpherical) {
                  // Use spherical interpolation for smooth orbital movement
                  const interpolatedRadius = lerp(startSphere.radius, endSphere.radius, easedProgress);

                  // Interpolate theta (horizontal angle) using shortest path
                  const thetaDelta = shortestAngleDelta(startSphere.theta, endSphere.theta);
                  const interpolatedTheta = startSphere.theta + thetaDelta * easedProgress;

                  // Interpolate phi (vertical angle)
                  const interpolatedPhi = lerp(startSphere.phi, endSphere.phi, easedProgress);

                  // Convert back to Cartesian
                  const interpolatedPos = sphericalToCartesian(
                    interpolatedRadius,
                    interpolatedTheta,
                    interpolatedPhi
                  );

                  camera.position.copy(interpolatedPos);
                } else {
                  // Use standard linear interpolation for close positions
                  startPos.lerp(endPos, easedProgress);
                  camera.position.copy(startPos);
                }

                // Always interpolate target linearly
                startTarget.lerp(endTarget, easedProgress);
                (controls as OrbitControlsType).target.copy(startTarget);
                (controls as OrbitControlsType).update();

                // --- [NEW] INTERPOLATE FOV ---
                const startFov = scene.startView.fov;
                const endFov = scene.endView.fov;
                if (camera instanceof THREE.PerspectiveCamera) {
                  camera.fov = lerp(startFov, endFov, easedProgress);
                  camera.updateProjectionMatrix(); // IMPORTANT!
                }
                // --- [NEW] INTERPOLATE MODEL TRANSFORMS ---
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
                // --- END OF NEW LOGIC ---
              }

              // This was in your original file, but you may want to remove
              // it now that 'custom' controls model rotation
              if (modelRef.current) {
                // modelRef.current.rotation.y = 0; // <-- Consider removing
              }
            }
            else if (scene.animationType === 'hold') {
              if (scene.startView) {
                // --- APPLY ALL PROPERTIES FROM STARTVIEW ---
                camera.position.set(...scene.startView.position);
                (controls as OrbitControlsType).target.set(...scene.startView.target);

                if (camera instanceof THREE.PerspectiveCamera) {
                  camera.fov = scene.startView.fov;
                  camera.updateProjectionMatrix();
                }

                modelRef.current.position.set(...scene.startView.modelPosition);
                modelRef.current.rotation.set(...scene.startView.modelRotation);
                modelRef.current.scale.set(scene.startView.modelScale, scene.startView.modelScale, scene.startView.modelScale);
                // --- END OF NEW LOGIC ---

              } else {
                camera.position.set(0, 0, 2);
                (controls as OrbitControlsType).target.set(0, 0, 0);
              }
              (controls as OrbitControlsType).update();
              if (modelRef.current) {
                modelRef.current.rotation.y = 0;
              }
            }
          }
          break;
        }
        timeSoFar = sceneEndTime;
      }

      // --- [FIX 2: Animation -> Sliders] ---
      // After the animation logic runs, report the new animated position
      // back up to the parent (which updates the sliders).
      // --- [UPDATED] ---
      const pos = camera.position.toArray() as [number, number, number];
      const target = controls.target.toArray() as [number, number, number];
      if (modelRef.current) {
        onLiveCameraChange({
          position: pos,
          target: target,
          fov: camera instanceof THREE.PerspectiveCamera ? camera.fov : 50,
          modelPosition: modelRef.current.position.toArray() as [number, number, number],
          modelRotation: [modelRef.current.rotation.x, modelRef.current.rotation.y, modelRef.current.rotation.z],
          modelScale: modelRef.current.scale.x, // (assuming uniform scale)
        });
      }
      // --- END OF FIX 2 ---
    }
  });

  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        position={directionalPosition}
        intensity={directionalIntensity}
      />
      <Environment preset="studio" environmentIntensity={environmentIntensity} />

      {model && (
        <group ref={modelRef}>
          <PhoneModel
            modelUrl={model.path}
            screenMaterialName={model.screenMaterial}
            textureUrl={textureUrl}
            uploadedFileType={uploadedFileType}
            scale={model.scale}
            flipY={model.flipY}
            textureRepeat={model.textureRepeat}
            textureOffset={model.textureOffset}
            rotation={model.rotation}
            screenReflection={screenReflection}
            isPlaying={isPlaying}
            currentTime={currentTime}
          />
        </group>
      )}

      <OrbitControls
        // --- ADD REF ---
        ref={controlsRef}
        enableZoom={true}
        minDistance={0.5}
        maxDistance={6}
        makeDefault
        target={[0, 0, 0]}
        enabled={!isPlaying && !isScrubbing}
        // --- [FIX 3: Drag -> Sliders] ---
        // When dragging (paused), report the new position up to the parent
        // (which updates the sliders).
       onChange={() => {
          if (controlsRef.current && !isPlaying && !isScrubbing) {
            const pos = controlsRef.current.object.position.toArray() as [number, number, number];
            const target = controlsRef.current.target.toArray() as [number, number, number];
            
            // --- THIS IS THE FIX ---
            if (modelRef.current) {
              onLiveCameraChange({
                position: pos,
                target: target,
                // --- ADDED CHECK FOR READING ---
                fov: camera instanceof THREE.PerspectiveCamera ? camera.fov : 50,
                modelPosition: modelRef.current.position.toArray() as [number, number, number],
                modelRotation: [modelRef.current.rotation.x, modelRef.current.rotation.y, modelRef.current.rotation.z],
                modelScale: modelRef.current.scale.x,
              });
            }
          }
        }}
      />
    </>
  );
}

export default forwardRef<SceneApi, SceneProps>(function Scene(
  props, // --- CHANGED TO 'props'
  ref
) {
  // --- DESTRUCTURE PROPS ---
  const {
    textureUrl,
    uploadedFileType,
    model,
    backgroundColor,
    isRecording,
    isPlaying,
    setIsPlaying,
    isScrubbing,
    scenes,
    currentTime,
    setCurrentTime,
    totalVideoDuration,
    setHasFinished,
    cameraPosition,
    cameraTarget,
    cameraFov,
    modelPosition,
    modelRotation,
    modelScale,
    ambientIntensity,
    directionalIntensity,
    directionalPosition,
    environmentIntensity,
    screenReflection,
    onLiveCameraChange, // --- GET THE NEW PROP ---
  } = props;

  return (
    <Canvas
      gl={{
        outputColorSpace: THREE.SRGBColorSpace,
        preserveDrawingBuffer: true,
        alpha: true,
      }}
      shadows
      camera={{ position: [0, 0, 2], fov: 50, near: 0.01, far: 100 }}
    >
      <SceneContent
        backgroundColor={backgroundColor}
        model={model}
        textureUrl={textureUrl}
        uploadedFileType={uploadedFileType}
        isRecording={isRecording}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        isScrubbing={isScrubbing}
        scenes={scenes}
        currentTime={currentTime}
        setCurrentTime={setCurrentTime}
        totalVideoDuration={totalVideoDuration}
        setHasFinished={setHasFinished}
        cameraPosition={cameraPosition}
        cameraTarget={cameraTarget}
        cameraFov={cameraFov}
        modelPosition={modelPosition}
        modelRotation={modelRotation}
        modelScale={modelScale}
        ambientIntensity={ambientIntensity}
        directionalIntensity={directionalIntensity}
        directionalPosition={directionalPosition}
        environmentIntensity={environmentIntensity}
        screenReflection={screenReflection}
        onLiveCameraChange={onLiveCameraChange} // --- PASS PROP DOWN ---
      />

      <SceneCaptureController ref={ref} />
    </Canvas>
  );
});