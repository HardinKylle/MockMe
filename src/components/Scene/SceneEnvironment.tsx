'use client';

import { Environment } from '@react-three/drei';
import { useScene } from '@/contexts/SceneContext';

export function SceneEnvironment() {
  const {
    sceneControls: {
      ambientIntensity,
      directionalIntensity,
      directionalPosition,
      environmentIntensity,
    },
  } = useScene();

  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        position={directionalPosition}
        intensity={directionalIntensity}
      />
      <Environment preset="studio" environmentIntensity={environmentIntensity} />
    </>
  );
}