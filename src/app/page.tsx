'use client';
import ImageUpload from '@/components/ImageUpload';
import { useUploadedImage } from '@/hooks/useUploadedImage';
import Scene from '@/components/Scene';

export default function App() {

  const { uploadedImageUrl, handleImageUpload } = useUploadedImage();

  return (

    <div className="w-full h-screen bg-white">
      {/* 3D Scene with the uploaded texture */}
      <Scene textureUrl={uploadedImageUrl} />


      {/* Floating upload control  */}
      <ImageUpload OnImageUpload={handleImageUpload} previewUrl={uploadedImageUrl} />
    </div>
  )
}