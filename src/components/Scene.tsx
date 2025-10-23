'use client';
import { forwardRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import PhoneModel from '@/components/PhoneModel';
import * as THREE from 'three';
import { SceneCaptureController } from './SceneCaptureController';
import { ModelData, models } from '@/configs/models';
interface SceneProps {
  textureUrl: string | null;
  model: ModelData;
}

export interface SceneApi {
  capture: (aspectRatio: string) => string | undefined;
}

models.forEach(model => useGLTF.preload(model.path));

export default forwardRef<SceneApi, SceneProps>(function Scene({ textureUrl, model }, ref) {
  return (
    <Canvas
      gl={{
        outputColorSpace: THREE.SRGBColorSpace,
        preserveDrawingBuffer: true 
      }}
      camera={{ position: [0, 0, 2], fov: 50, near: 0.01, far: 100 }}
    >
      <ambientLight intensity={0.1} />
      <directionalLight position={[2, 3, 4]} intensity={0.4} />
      <Environment preset="city" environmentIntensity={0.5} />

    {model && (
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
      )}

      <OrbitControls
        enableZoom={true}
        minDistance={0.5}
        maxDistance={6}
        makeDefault
        target={[0, 0, 0]}
      />

      <SceneCaptureController ref={ref} />
    </Canvas>
  );
});