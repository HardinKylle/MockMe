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
    if (!isPlaying) return; // Not playing, do nothing

    // Increment the playhead time
    const newTime = currentTime + delta;
    setCurrentTime(newTime);

    // Find the total duration of the animation
    const totalDuration = scenes.reduce((acc, scene) => acc + scene.duration, 0);

    // Stop playing if we reach the end
    if (newTime > totalDuration) {
      setIsPlaying(false);
      setCurrentTime(0);
      return;
    }

    // Find the currently active scene
    let timeSoFar = 0;
    const activeScene = scenes.find((scene) => {
      const sceneEndTime = timeSoFar + scene.duration;
      const isActive = newTime >= timeSoFar && newTime < sceneEndTime;
      timeSoFar = sceneEndTime;
      return isActive;
    });

    //Apply animation based on the active scene
    if (modelRef.current) {
      if (activeScene?.animationType === 'spin') {
        modelRef.current.rotation.y += delta * 0.5;
      } else {

      }
    }
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
      />

      <SceneCaptureController ref={ref} />
    </Canvas>
  );
});