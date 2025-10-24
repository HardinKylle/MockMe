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
  setIsPlaying: (isPlaying: boolean) => void; // <--- Add this
  scenes: AnimationScene[]; // <--- Add this
  currentTime: number; // <--- Add this
  setCurrentTime: (time: number | ((prevTime: number) => number)) => void; // <--- Add this
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
  setIsPlaying, // <--- Destructure
  scenes, // <--- Destructure
  currentTime, // <--- Destructure
  setCurrentTime, // <--- Destructure
}: Omit<SceneProps, 'backgroundColor'> & { backgroundColor: string }) {
  const { gl } = useThree();
  const modelRef = useRef<THREE.Group>(null);

  useEffect(() => {
    // ... (gl.setClear... unchanged)
  }, [gl, backgroundColor]);

  // --- UPDATED ANIMATION LOOP ---
  useFrame((state, delta) => {
    if (!isPlaying) return; // Not playing, do nothing

    // 1. Increment the playhead time
    const newTime = currentTime + delta;
    setCurrentTime(newTime);

    // 2. Find the total duration of the animation
    const totalDuration = scenes.reduce((acc, scene) => acc + scene.duration, 0);

    // 3. Stop playing if we reach the end
    if (newTime > totalDuration) {
      setIsPlaying(false);
      setCurrentTime(0);
      return;
    }

    // 4. Find the currently active scene
    let timeSoFar = 0;
    const activeScene = scenes.find((scene) => {
      const sceneEndTime = timeSoFar + scene.duration;
      const isActive = newTime >= timeSoFar && newTime < sceneEndTime;
      timeSoFar = sceneEndTime;
      return isActive;
    });

    // 5. Apply animation based on the active scene
    if (modelRef.current) {
      if (activeScene?.animationType === 'spin') {
        // Apply spin animation
        modelRef.current.rotation.y += delta * 0.5; // Adjust 0.5 to change speed
      } else {
        // It's 'static' or undefined, do nothing
        // (We can reset rotation here later if we want)
      }
    }
  });

  return (
    <>
      <ambientLight intensity={0.1} />
      <directionalLight position={[2, 3, 4]} intensity={0.4} />
      <Environment preset="studio" environmentIntensity={0.5} />

      {model && (
        <group ref={modelRef}> {/* <--- Wrap PhoneModel in a group */}
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
        // Disable orbit controls while animation is playing
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
    setIsPlaying, // <--- Get prop
    scenes, // <--- Get prop
    currentTime, // <--- Get prop
    setCurrentTime, // <--- Get prop
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
        setIsPlaying={setIsPlaying} // <--- Pass prop
        scenes={scenes} // <--- Pass prop
        currentTime={currentTime} // <--- Pass prop
        setCurrentTime={setCurrentTime} // <--- Pass prop
      />

      <SceneCaptureController ref={ref} />
    </Canvas>
  );
});