'use client';
import ImageUpload from '@/components/ImageUpload';
import { useUploadedImage } from '@/hooks/useUploadedImage';
import Scene, { SceneApi } from '@/components/Scene';
import CaptureControls from '@/components/CaptureControls';
import { useRef, useState } from 'react';
import PreviewModal from '@/components/PreviewModal';

export default function App() {

  const { uploadedImageUrl, handleImageUpload } = useUploadedImage();
  const sceneRef = useRef<SceneApi>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);

  const handleCapture = (aspectRatio: string) => {
    setIsLoading(true);
    console.log('Capture requested with aspect ratio:', aspectRatio);

    try {
      const dataUrl = sceneRef.current?.capture(aspectRatio);

      if (dataUrl) {
        console.log('Capture successful.');
        // 3. Set the image URL in state
        setCapturedImageUrl(dataUrl);
      } else {
        console.error('Capture failed.');
      }
    } catch (error) {
      console.error('Error during capture:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (

    <div className="w-full h-screen bg-white">
      {/* 3D Scene with the uploaded texture */}
      <Scene ref={sceneRef} textureUrl={uploadedImageUrl} />
      
      {/* Floating container for all controls */}
      <div className="fixed bottom-4 right-4 z-10 flex items-center gap-2">

        {/* Capture controls */}
        <CaptureControls onCapture={handleCapture} />
        {/* Floating upload control */}

        <ImageUpload OnImageUpload={handleImageUpload} previewUrl={uploadedImageUrl} />

        {capturedImageUrl && (
          <PreviewModal
            imageUrl={capturedImageUrl}
            onClose={() => setCapturedImageUrl(null)}
          />
        )}

      </div>
    </div>
  )
}