'use client';
import { forwardRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import PhoneModel from '@/components/PhoneModel';
import * as THREE from 'three';
import { SceneCaptureController } from './SceneCaptureController';

interface SceneProps {
  textureUrl: string | null;
}

export interface SceneApi {
  capture: (aspectRatio: string) => string | undefined;
}

export default forwardRef<SceneApi, SceneProps>(function Scene({ textureUrl }, ref) {
  return (
    <Canvas
      gl={{
        outputColorSpace: THREE.SRGBColorSpace,
        preserveDrawingBuffer: true // Still needed for screenshots
      }}
      camera={{ position: [0, 0, 2], fov: 50, near: 0.01, far: 100 }}
    >
      <ambientLight intensity={0.1} />
      <directionalLight position={[2, 3, 4]} intensity={0.4} />
      <Environment preset="studio" environmentIntensity={0.5} />

      <PhoneModel textureUrl={textureUrl} />

      <OrbitControls
        enableZoom={true}
        minDistance={0.5}
        maxDistance={6}
        makeDefault
        target={[0, 0, 0]}
      />

      {/* 6. Add the controller and pass the ref to it */}
      <SceneCaptureController ref={ref} />
    </Canvas>
  );
});