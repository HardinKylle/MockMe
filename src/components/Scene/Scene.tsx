'use client';

// Main 3D scene component for rendering phone model, camera controls, and animation

import { forwardRef, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import PhoneModel from '@/components/Scene/PhoneModel';
import * as THREE from 'three';
import { SceneCaptureController } from './/SceneCaptureController';
import { models } from '@/configs/models';
import { type OrbitControls as OrbitControlsType } from 'three-stdlib';
import { SceneState } from '@/types/animation';
import { useAsset } from '@/contexts/AssetContext';
import { useAnimation } from '@/contexts/AnimationContext';
import { useScene } from '@/contexts/SceneContext';
import { useAnimationLoop } from '@/hooks/useAnimationLoop';
import { SceneEnvironment } from './SceneEnvironment';

interface SceneProps {
  backgroundColor: string;
  onLiveCameraChange: (newState: SceneState) => void;
}

export interface SceneApi {
  capture: (aspectRatio: string) => string | undefined;
  setView: (position: readonly [number, number, number], target: readonly [number, number, number]) => void;
  getView: () => SceneState | null;
  startRecording: (aspectRatio: string, totalDuration: number, onComplete: () => void) => void;
  stopRecording: () => void;
}

// Preload all model GLTFs for faster switching
models.forEach(model => useGLTF.preload(model.path));

const vec3 = new THREE.Vector3();

function SceneContent({
  backgroundColor,
  onLiveCameraChange,
}: SceneProps) {
  const { gl, camera, controls } = useThree();
  const modelRef = useRef<THREE.Group>(null);

  const {
    uploadedFileUrl,
    uploadedFileType,
    selectedModel
  } = useAsset();

  const {
    isPlaying,
    currentTime,
    isScrubbing, 
  } = useAnimation();

  const {
    sceneControls: {
      cameraPosition,
      cameraTarget,
      cameraFov,
      modelPosition,
      modelRotation,
      modelScale,
      screenReflection, 
    }
  } = useScene();

  // OrbitControls ref for imperative updates
  const controlsRef = useRef<OrbitControlsType>(controls as OrbitControlsType);
  useEffect(() => {
    controlsRef.current = controls as OrbitControlsType;
  }, [controls]);

  // Sync camera FOV
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = cameraFov;
      camera.updateProjectionMatrix();
    }
  }, [camera, cameraFov]);

  // Apply camera position/target from sliders when paused
  useEffect(() => {
    if (controlsRef.current && !isPlaying && !isScrubbing) {
      const camPos = controlsRef.current.object.position;
      const targetPos = controlsRef.current.target;
      if (
        !camPos.equals(vec3.set(...cameraPosition)) ||
        !targetPos.equals(vec3.set(...cameraTarget))
      ) {
        camPos.set(...cameraPosition);
        targetPos.set(...cameraTarget);
        controlsRef.current.update();
      }
    }
  }, [isPlaying, isScrubbing, cameraPosition, cameraTarget]);

  // Apply model transforms from sliders
useEffect(() => {
    if (modelRef.current && !isPlaying && !isScrubbing) {
      modelRef.current.position.set(...modelPosition);
      modelRef.current.rotation.set(...modelRotation);
      modelRef.current.scale.set(modelScale, modelScale, modelScale);
    }
  }, [modelPosition, modelRotation, modelScale, isPlaying, isScrubbing]);
  // Set background color or transparency
  useEffect(() => {
    if (backgroundColor === 'transparent') {
      gl.setClearAlpha(0);
    } else {
      gl.setClearAlpha(1);
      gl.setClearColor(new THREE.Color(backgroundColor));
    }
  }, [gl, backgroundColor]);

  useAnimationLoop({
    modelRef,
    controlsRef,
    onLiveCameraChange
  });

  return (
    <>
      <SceneEnvironment />
      <group ref={modelRef}>
        <PhoneModel
          modelUrl={selectedModel.path}
          screenMaterialName={selectedModel.screenMaterial}
          textureUrl={uploadedFileUrl}
          uploadedFileType={uploadedFileType}
          scale={selectedModel.scale}
          flipY={selectedModel.flipY}
          textureRepeat={selectedModel.textureRepeat}
          textureOffset={selectedModel.textureOffset}
          rotation={selectedModel.rotation}
          screenReflection={screenReflection}
          isPlaying={isPlaying}
          currentTime={currentTime}
        />
      </group>

      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        minDistance={0.5}
        maxDistance={6}
        makeDefault
        target={[0, 0, 0]}
        enabled={!isPlaying && !isScrubbing}
        onChange={() => {
          if (controlsRef.current && !isPlaying && !isScrubbing) {
            const pos = controlsRef.current.object.position.toArray() as [number, number, number];
            const target = controlsRef.current.target.toArray() as [number, number, number];
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
        }}
      />
    </>
  );
}

export default forwardRef<SceneApi, SceneProps>(function Scene(
  props,
  ref
) {
  const {
    backgroundColor,
    onLiveCameraChange,
  } = props;

  const { isExporting } = useAnimation();

  return (
    <Canvas
      frameloop={isExporting ? 'never' : 'always'}
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
        onLiveCameraChange={onLiveCameraChange}
      />
      <SceneCaptureController ref={ref} />
    </Canvas>
  );
});