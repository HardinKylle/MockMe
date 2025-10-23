'use client';
import { forwardRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import PhoneModel from '@/components/PhoneModel';
import * as THREE from 'three';
import { SceneCaptureController } from './SceneCaptureController';
import { ModelData, models } from '@/configs/models';

interface SceneProps {
  textureUrl: string | null;
  model: ModelData;
  backgroundColor: string;
}

export interface SceneApi {
  capture: (aspectRatio: string) => string | undefined;
  setView: (position: readonly [number, number, number], target: readonly [number, number, number]) => void;
}

models.forEach(model => useGLTF.preload(model.path));

function SceneContent({ backgroundColor, model, textureUrl }: Omit<SceneProps, 'backgroundColor'> & { backgroundColor: string }) {
  const { gl } = useThree();

  useEffect(() => {
    if (backgroundColor === 'transparent') {
      gl.setClearAlpha(0);
    } else {
      gl.setClearAlpha(1);
      gl.setClearColor(new THREE.Color(backgroundColor));
    }
  }, [gl, backgroundColor]);

  return (
    <>
      <ambientLight intensity={0.1} />
      <directionalLight position={[2, 3, 4]} intensity={0.4} />
      <Environment preset="studio" environmentIntensity={0.5} />

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
    </>
  );
}

export default forwardRef<SceneApi, SceneProps>(function Scene({ textureUrl, model, backgroundColor }, ref) {
  return (
    <Canvas
      gl={{
        outputColorSpace: THREE.SRGBColorSpace,
        preserveDrawingBuffer: true,
        alpha: true
      }}
      camera={{ position: [0, 0, 2], fov: 50, near: 0.01, far: 100 }}
    >

      <SceneContent
        backgroundColor={backgroundColor}
        model={model}
        textureUrl={textureUrl}
      />

      <SceneCaptureController ref={ref} />
    </Canvas>
  );
});