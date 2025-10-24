'use client';
import ImageUpload from '@/components/ImageUpload';
import { useUploadedImage } from '@/hooks/useUploadedImage';
import Scene, { SceneApi } from '@/components/Scene';
import CaptureControls from '@/components/CaptureControls';
import { useRef, useState, useLayoutEffect } from 'react';
import PreviewModal from '@/components/PreviewModal';
import { useModelSwitcher } from '@/hooks/useModelSwitcher';
import ModelSelector from '@/components/ModelSelector';
import BackgroundPicker from '@/components/BackgroundPicker';
import { presetViews } from '@/configs/views';
import { ViewfinderCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { useWindowSize } from '@/hooks/useWindowSize';

export default function App() {
  const { uploadedImageUrl, handleImageUpload } = useUploadedImage();
  const sceneRef = useRef<SceneApi>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const { selectedModel, setModel, allModels } = useModelSwitcher();
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [showViews, setShowViews] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('16:9');

  const { width: windowWidth, height: windowHeight } = useWindowSize();

  const handleCapture = () => {
    setIsLoading(true);

    try {
      const dataUrl = sceneRef.current?.capture(aspectRatio);

      if (dataUrl) {
        console.log('Capture successful.');
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
    setShowViews(false);
  };

  const getFrameStyle = () => {

    if (aspectRatio === '16:9') {
      return { width: '100%', height: '100%' };
    }
    // -------------------------

    if (windowWidth === 0 || windowHeight === 0) {
      return { width: '100%', height: '100%' };
    }

    const [w, h] = aspectRatio.split(':').map(Number);
    const targetRatio = w / h;
    const windowRatio = windowWidth / windowHeight;

    let frameWidth: string | number;
    let frameHeight: string | number;

    if (windowRatio > targetRatio) {
      frameHeight = windowHeight;
      frameWidth = windowHeight * targetRatio;
    } else {
      frameWidth = windowWidth;
      frameHeight = windowWidth / targetRatio;
    }

    return {
      width: `${frameWidth}px`,
      height: `${frameHeight}px`,
    };
  };

  const frameStyle = getFrameStyle();

  return (

    <div className="w-full h-screen bg-gray-950 relative overflow-hidden">
    
      <div
        style={{
          ...frameStyle,
          backgroundColor: backgroundColor 
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <Scene
          ref={sceneRef}
          textureUrl={uploadedImageUrl}
          model={selectedModel}
          backgroundColor={backgroundColor}
        />
      </div>

      {/* Floating container for Preset Views */}
      <div className="fixed top-4 right-4 z-10 flex flex-col items-end gap-2">
        <Button
          onClick={() => setShowViews(!showViews)}
          variant="secondary"
          size="default"
          tooltip="Preset Views"
          tooltipSide="bottom"
          isActive={showViews}
        >
          <ViewfinderCircleIcon className="h-5 w-5 text-gray-700" />
        </Button>
        {showViews && (
          <div className="w-48 rounded-md shadow-lg bg-white ring-1 ring-opacity-5 overflow-hidden">
            {presetViews.map((view) => (
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

        <CaptureControls
          onCapture={handleCapture}
          isLoading={isLoading}
          aspectRatio={aspectRatio}
          onAspectRatioChange={setAspectRatio}
        />

        <ImageUpload
          OnImageUpload={handleImageUpload}
          previewUrl={uploadedImageUrl}
        />

        {capturedImageUrl && (
          <PreviewModal
            imageUrl={capturedImageUrl}
            onClose={() => setCapturedImageUrl(null)}
          />
        )}
      </div>
    </div>
  );
}