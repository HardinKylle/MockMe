'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import PhoneModel from '@/components/PhoneModel';
import ImageUpload from '@/components/ImageUpload';
import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
export default function App() {
  // This state will hold the temporary URL for the texture
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const handleImageUpload = (file: File | null) => {
    // IMPORTANT: Clean up the previous object URL to prevent memory leaks
    if (uploadedImageUrl) {
      URL.revokeObjectURL(uploadedImageUrl);
    }

    if (file) {
      // Create a new temporary URL for the selected file
      const imageUrl = URL.createObjectURL(file);
      setUploadedImageUrl(imageUrl);
    } else {
      // User cleared the image
      setUploadedImageUrl(null);
    }
  };

  // Effect to clean up the URL when the component unmounts
  useEffect(() => {
    // This is the cleanup function that runs when the component is destroyed
    return () => {
      if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl);
      }
    };
  }, [uploadedImageUrl]); // Re-run effect if the URL changes

  return (

    <div className="w-full h-screen bg-white">
      <Canvas gl={{ outputColorSpace: THREE.SRGBColorSpace }}
        camera={{ position: [0, 0, 0.7], fov: 50, near: 0.01, far: 100 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[2, 3, 4]} intensity={0.8} />
        <Environment preset="studio" />

        <PhoneModel textureUrl={uploadedImageUrl} />


        <OrbitControls enableZoom={true} minDistance={2.2} maxDistance={4} makeDefault target={[0, 0, 0]} />
      </Canvas>

      {/* Floating upload control  */}
      <ImageUpload OnImageUpload={handleImageUpload} />
    </div>
  )
}