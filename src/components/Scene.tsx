'use client';
import { forwardRef, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import PhoneModel from '@/components/PhoneModel';
import * as THREE from 'three';
import { SceneCaptureController } from './SceneCaptureController';
import { ModelData, models } from '@/configs/models';
import { type OrbitControls as OrbitControlsType } from 'three-stdlib';
import { AnimationScene, CameraView, AnimationType } from '@/types/animation';
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
}

export interface SceneApi {
  capture: (aspectRatio: string) => string | undefined;
  setView: (position: readonly [number, number, number], target: readonly [number, number, number]) => void;
  getView: () => CameraView | null;
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
}: Omit<SceneProps, 'backgroundColor' | 'isScrubbing'> & { backgroundColor: string; isScrubbing: boolean }) {
  const { gl, camera, controls } = useThree();
  const modelRef = useRef<THREE.Group>(null);

  // Apply camera FOV
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = cameraFov;
      camera.updateProjectionMatrix();
    }
  }, [camera, cameraFov]);

  // // Apply camera position and target when not playing/scrubbing AND at the start
  // useEffect(() => {
  //   if (!isPlaying && !isScrubbing && currentTime === 0 && controls) {
  //     camera.position.set(...cameraPosition);
  //     (controls as OrbitControlsType).target.set(...cameraTarget);
  //     (controls as OrbitControlsType).update();
  //   }
  // }, [isPlaying, isScrubbing, currentTime, cameraPosition, cameraTarget, camera, controls]);

  // Apply model transforms
  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.position.set(...modelPosition);
      modelRef.current.rotation.set(...modelRotation);
      modelRef.current.scale.set(modelScale, modelScale, modelScale);
    }
  }, [modelPosition, modelRotation, modelScale]);

  // useEffect(() => {
  //   // Only reset if we're starting to play AND we're at the beginning
  //   if (isPlaying && currentTime === 0) {
  //     if (modelRef.current) {
  //       modelRef.current.rotation.y = 0;
  //     }

  //     const firstScene = scenes[0];

  //     if (
  //       firstScene &&
  //       (firstScene.animationType === 'custom' ||
  //         firstScene.animationType === 'hold') &&
  //       firstScene.startView
  //     ) {
  //       camera.position.set(...firstScene.startView.position);
  //       (controls as OrbitControlsType).target.set(...firstScene.startView.target);
  //     } else {
  //       camera.position.set(0, 0, 2);
  //       (controls as OrbitControlsType).target.set(0, 0, 0);
  //     }
  //   }
  // }, [isPlaying, currentTime, scenes, camera, controls]);

  useEffect(() => {
    if (backgroundColor === 'transparent') {
      gl.setClearAlpha(0);
    } else {
      gl.setClearAlpha(1);
      gl.setClearColor(new THREE.Color(backgroundColor));
    }
  }, [gl, backgroundColor]);

useFrame((state, delta) => {
    // 1. Advance time ONLY if isPlaying is true
    if (isPlaying) {
      
      // --- THIS IS THE FIX ---
      // We must ALWAYS use the real-time delta to advance
      // the animation. This ensures that even if the frame
      // rate is high (e.g., 144Hz) or low (e.g., 30Hz),
      // the animation 'currentTime' advances correctly
      // in sync with real-world time.
      const frameDelta = delta; // <--- THIS IS THE CHANGE

      setCurrentTime((prevTime) => {
        // --- MODIFIED: Use our new frameDelta ---
        const newTime = prevTime + frameDelta;

        if (newTime >= totalVideoDuration) {
          setIsPlaying(false);
          setHasFinished(true);
          // --- MODIFIED: Return total duration to prevent jumping to 0 ---
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
              }
              if (modelRef.current) {
                modelRef.current.rotation.y = 0;
              }
            }
            else if (scene.animationType === 'hold') {
              if (scene.startView) {
                camera.position.set(...scene.startView.position);
                (controls as OrbitControlsType).target.set(...scene.startView.target);
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
        enableZoom={true}
        minDistance={0.5}
        maxDistance={6}
        makeDefault
        target={[0, 0, 0]}
        enabled={!isPlaying && !isScrubbing}
      />
    </>
  );
}

export default forwardRef<SceneApi, SceneProps>(function Scene(
  {
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
  },
  ref
) {
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
      />

      <SceneCaptureController ref={ref} />
    </Canvas>
  );
});