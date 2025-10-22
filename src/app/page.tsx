'use client';
import ImageUpload from '@/components/ImageUpload';
import { useUploadedImage } from '@/hooks/useUploadedImage';
import Scene, { SceneApi } from '@/components/Scene';
import CaptureControls from '@/components/CaptureControls';
import { useRef, useState } from 'react';
import PreviewModal from '@/components/PreviewModal';
import { useModelSwitcher } from '@/hooks/useModelSwitcher';
export default function App() {

  const { uploadedImageUrl, handleImageUpload } = useUploadedImage();
  const sceneRef = useRef<SceneApi>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const { selectedModel, switchModel, nextModelName } = useModelSwitcher();

  const handleCapture = (aspectRatio: string) => {
    setIsLoading(true);

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
      <Scene
        ref={sceneRef}
        textureUrl={uploadedImageUrl}
        model={selectedModel}
      />
      {/* Floating container for all controls */}
      <div className="fixed bottom-4 right-4 z-10 flex items-center gap-2">

        <button
          onClick={switchModel}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg"
        >
          Switch to {nextModelName}
        </button>

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