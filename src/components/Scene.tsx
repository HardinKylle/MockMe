'use client';
import { forwardRef, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import PhoneModel from '@/components/PhoneModel';
import * as THREE from 'three';
import { SceneCaptureController } from './SceneCaptureController';
import { ModelData, models } from '@/configs/models';
import { AnimationScene } from '@/types/animation';
interface SceneProps {
  textureUrl: string | null;
  model: ModelData;
  backgroundColor: string;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  scenes: AnimationScene[];
  currentTime: number;
  setCurrentTime: (time: number | ((prevTime: number) => number)) => void;
  totalVideoDuration: number;
}

export interface SceneApi {
  capture: (aspectRatio: string) => string | undefined;
  setView: (position: readonly [number, number, number], target: readonly [number, number, number]) => void;
}

models.forEach(model => useGLTF.preload(model.path));

function SceneContent({
  backgroundColor,
  model,
  textureUrl,
  isPlaying,
  setIsPlaying,
  scenes,
  currentTime,
  setCurrentTime,
  totalVideoDuration,
}: Omit<SceneProps, 'backgroundColor'> & { backgroundColor: string }) {
  const { gl } = useThree();
  const modelRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (backgroundColor === 'transparent') {
      gl.setClearAlpha(0);
    } else {
      gl.setClearAlpha(1);
      gl.setClearColor(new THREE.Color(backgroundColor));
    }
  }, [gl, backgroundColor]);

 useFrame((state, delta) => {
    if (!isPlaying) return;

    setCurrentTime((prevTime) => {
      const newTime = prevTime + delta;

      if (newTime > totalVideoDuration) {
        setIsPlaying(false);
        return 0;
      }

      let timeSoFar = 0;
      let sceneFound = false;

      for (const scene of scenes) {
        const sceneStartTime = timeSoFar;
        const sceneEndTime = sceneStartTime + scene.duration;
        
        // Check if the playhead is in this scene
        if (newTime >= sceneStartTime && newTime < sceneEndTime) {
          sceneFound = true;
          if (modelRef.current) {
            if (scene.animationType === 'spin') {
              // Find progress (0.0 to 1.0)
              const timeInScene = newTime - sceneStartTime;
              const sceneProgress = timeInScene / scene.duration;

              // Calculate target rotation (0 to 360 degrees)
              const targetRotation = sceneProgress * (2 * Math.PI); // 2*PI = 360 degrees

              // Set the rotation directly
              modelRef.current.rotation.y = targetRotation;
            }
          }
          break; // Stop searching once we find the active scene
        }
        timeSoFar = sceneEndTime; // Move to the next scene's start time
      }

      // If no scene is active (e.g., in a gap), do nothing
      if (!sceneFound) {
      }

      return newTime;
    });
  });

  return (
    <>
      <ambientLight intensity={0.1} />
      <directionalLight position={[2, 3, 4]} intensity={0.4} />
      <Environment preset="studio" environmentIntensity={0.5} />

      {model && (
        <group ref={modelRef}>
          <PhoneModel
            modelUrl={model.path}
            screenMaterialName={model.screenMaterial}
            textureUrl={textureUrl}
            scale={model.scale}
            flipY={model.flipY}
            textureRepeat={model.textureRepeat}
            textureOffset={model.textureOffset}
            rotation={model.rotation}
          />
        </group>
      )}

      <OrbitControls
        enableZoom={true}
        minDistance={0.5}
        maxDistance={6}
        makeDefault
        target={[0, 0, 0]}
        enabled={!isPlaying}
      />
    </>
  );
}

export default forwardRef<SceneApi, SceneProps>(function Scene(
  {
    textureUrl,
    model,
    backgroundColor,
    isPlaying,
    setIsPlaying,
    scenes,
    currentTime,
    setCurrentTime,
    totalVideoDuration
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
      camera={{ position: [0, 0, 2], fov: 50, near: 0.01, far: 100 }}
    >
      <SceneContent
        backgroundColor={backgroundColor}
        model={model}
        textureUrl={textureUrl}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        scenes={scenes}
        currentTime={currentTime}
        setCurrentTime={setCurrentTime}
        totalVideoDuration={totalVideoDuration}
      />

      <SceneCaptureController ref={ref} />
    </Canvas>
  );
});