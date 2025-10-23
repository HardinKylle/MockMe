'use client';
import ImageUpload from '@/components/ImageUpload';
import { useUploadedImage } from '@/hooks/useUploadedImage';
import Scene, { SceneApi } from '@/components/Scene';
import CaptureControls from '@/components/CaptureControls';
import { useRef, useState } from 'react';
import PreviewModal from '@/components/PreviewModal';
import { useModelSwitcher } from '@/hooks/useModelSwitcher';
import ModelSelector from '@/components/ModelSelector';
import BackgroundPicker from '@/components/BackgroundPicker';
import { presetViews } from '@/configs/views';
import { ViewfinderCircleIcon } from '@heroicons/react/24/outline';

export default function App() {

  const { uploadedImageUrl, handleImageUpload } = useUploadedImage();
  const sceneRef = useRef<SceneApi>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const { selectedModel, setModel, allModels } = useModelSwitcher();
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [showViews, setShowViews] = useState(false);

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

  const handleModelChange = (modelName: string) => {
    setModel(modelName);
    handleImageUpload(null);
  };

  const handlePresetClick = (view: typeof presetViews[number]) => {
    sceneRef.current?.setView(view.position, view.target);
    setShowViews(false); // <-- Hide the menu after selection
  };

  return (

    <div className="w-full h-screen bg-white">
      {/* 3D Scene with the uploaded texture */}
      <Scene
        ref={sceneRef}
        textureUrl={uploadedImageUrl}
        model={selectedModel}
        backgroundColor={backgroundColor}
      />

      {/* Floating container for Preset Views */}
      <div className="fixed top-4 right-4 z-10 flex flex-col items-end gap-2">
        {/* Main Toggle Button */}
        <button
          onClick={() => setShowViews(!showViews)}
          className="bg-white text-gray-900 p-4 rounded-full shadow-lg border border-gray-200 transform  hover:scale-105 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200"
        >

          <ViewfinderCircleIcon className="h-5 w-5 text-gray-700" />
        </button>

        {/* Conditionally rendered list of views */}
        {showViews && (
          <div className="flex flex-col">
            {presetViews.map((view) => (
              <button
                key={view.name}
                onClick={() => handlePresetClick(view)}
                className="
                    w-full px-3 py-2 border-t border-gray-300 text-sm font-medium 
                    text-gray-700 hover:bg-gray-50 focus:outline-none 
                    focus:ring-2 focus:ring-offset-0 focus:ring-indigo-500
                  "
              >
                {view.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Floating container for all controls */}
      <div className="fixed bottom-4 right-4 z-10 flex items-center gap-2">

        <BackgroundPicker
          color={backgroundColor}
          onChange={setBackgroundColor}
        />

        <ModelSelector
          allModels={allModels}
          selectedModel={selectedModel}
          onModelSelect={handleModelChange}
        />

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