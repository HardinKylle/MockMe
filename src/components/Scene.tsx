'use client';
import { forwardRef, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import PhoneModel from '@/components/PhoneModel';
import * as THREE from 'three';
import { SceneCaptureController } from './SceneCaptureController';
import { ModelData, models } from '@/configs/models';
import { AnimationScene, CameraView } from '@/types/animation';
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
  getView: () => CameraView | null;
}

models.forEach(model => useGLTF.preload(model.path));

const easeInOutCubic = (t: number) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const startPos = new THREE.Vector3();
const endPos = new THREE.Vector3();
const startTarget = new THREE.Vector3();
const endTarget = new THREE.Vector3();

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
  const { gl, camera, controls } = useThree();
  const modelRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (isPlaying) {
      // We just pressed Play
      if (modelRef.current) {
        // Reset the model's rotation to 0
        modelRef.current.rotation.y = 0;
      }

      // Reset camera to the start of the *first* scene
      const firstScene = scenes[0];
      if (firstScene?.animationType === 'custom' && firstScene.startView) {
        // If first scene is custom, set camera to its start view
        camera.position.set(...firstScene.startView.position);
        (controls as any).target.set(...firstScene.startView.target);
      } else {
        // Otherwise, set to default view (or whatever you like)
        camera.position.set(0, 0, 2);
        (controls as any).target.set(0, 0, 0);
      }
    }
  }, [isPlaying, scenes, camera, controls]);

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

        if (newTime >= sceneStartTime && newTime < sceneEndTime) {
          sceneFound = true;
          const timeInScene = newTime - sceneStartTime;
          const sceneProgress = timeInScene / scene.duration;
          const easedProgress = easeInOutCubic(sceneProgress);

          // --- Check for controls before doing any work ---
          if (modelRef.current && controls) {
            if (scene.animationType === 'custom') {
              if (scene.startView && scene.endView) {
                // ... (Custom view lerp logic - unchanged)
                startPos.set(...scene.startView.position);
                endPos.set(...scene.endView.position);
                startTarget.set(...scene.startView.target);
                endTarget.set(...scene.endView.target);
                startPos.lerp(endPos, easedProgress);
                camera.position.copy(startPos);
                startTarget.lerp(endTarget, easedProgress);
                (controls as any).target.copy(startTarget);
                (controls as any).update();
              }
            } else if (scene.animationType === 'spin') {
              // --- THIS IS THE FIX ---
              // 1. Force camera to default position
              camera.position.set(0, 0, 2);
              (controls as any).target.set(0, 0, 0);
              (controls as any).update();
              // ---------------------

              // 2. Set the model rotation
              const targetRotation = sceneProgress * (2 * Math.PI);
              modelRef.current.rotation.y = targetRotation;
            } else if (scene.animationType === 'hold') {
              // --- 1. THIS IS THE NEW "HOLD" LOGIC ---
              if (scene.startView) {
                camera.position.set(...scene.startView.position);
                (controls as any).target.set(...scene.startView.target);
              } else {
                camera.position.set(0, 0, 2);
                (controls as any).target.set(0, 0, 0);
              }
              (controls as any).update();
              modelRef.current.rotation.y = 0;
            }
          }
          break;
        }
        timeSoFar = sceneEndTime;
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