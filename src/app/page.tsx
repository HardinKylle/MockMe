'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import PhoneModel from '@/components/PhoneModel';
import { use } from 'react';

export default function App() {
  return (
    
    <div className="w-full h-screen bg-white">
     <Canvas camera={{ position: [0, 0, 0.7], fov: 50, near: 0.01, far: 10 }}>
    <ambientLight intensity={1.2} />
    <directionalLight position={[2, 3, 4]} intensity={1.5} />
    <Environment preset="studio" />
    <PhoneModel />
    <OrbitControls enableZoom={true} minDistance={0.25} maxDistance={0.5} makeDefault target={[0, 0, 0]} />
  </Canvas>
    </div>
  )
}