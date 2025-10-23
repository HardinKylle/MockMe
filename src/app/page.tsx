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
import { Button } from '@/components/ui/Button';

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
        
        {/* REFACTOR THE MAIN TOGGLE BUTTON */}
        <Button
          onClick={() => setShowViews(!showViews)}
          variant="secondary"
          size="default"
          tooltip="Preset Views" 
          tooltipSide="bottom"
        >
          <ViewfinderCircleIcon className="h-5 w-5 text-gray-700" />
        </Button>

        {/* Conditionally rendered list of views */}
        {showViews && (
          // 3. Added a container for consistent dropdown styling
          <div className="w-48 rounded-md shadow-lg bg-white ring-1 ring-opacity-5 overflow-hidden">
            {presetViews.map((view) => (
              // 4. REFACTOR THE LIST BUTTONS
              <Button
                key={view.name}
                onClick={() => handlePresetClick(view)}
                variant="menu-item"
                size="menu-item"
                className="border-t border-gray-100 first:border-t-0" 
              >
                {view.name}
              </Button>
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