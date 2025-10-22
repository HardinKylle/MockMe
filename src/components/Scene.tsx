'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import PhoneModel from '@/components/PhoneModel';
import * as THREE from 'three';

interface SceneProps {
  textureUrl: string | null;
}

export default function Scene({ textureUrl }: SceneProps) {
  return (
    <Canvas
      gl={{ outputColorSpace: THREE.SRGBColorSpace }}
      camera={{ position: [0, 0, 2], fov: 50, near: 0.01, far: 100 }}
    >
      <ambientLight intensity={0.2} />
      <directionalLight position={[2, 3, 4]} intensity={0.8} />
      <Environment preset="studio" />

      {/* The scene now receives the textureUrl as a prop */}
      <PhoneModel textureUrl={textureUrl} />

      <OrbitControls
        enableZoom={true}
        minDistance={0.5}
        maxDistance={6}
        makeDefault
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}