'use client';
import FileUpload from '@/components/FileUpload';
import { useUploadedFile } from '@/hooks/useUploadedFile';
import Scene, { SceneApi } from '@/components/Scene';
import CaptureControls from '@/components/CaptureControls';
import { useRef, useState, useLayoutEffect, useEffect } from 'react';
import PreviewModal from '@/components/PreviewModal';
import { useModelSwitcher } from '@/hooks/useModelSwitcher';
import ModelSelector from '@/components/ModelSelector';
import BackgroundPicker from '@/components/BackgroundPicker';
import { presetViews } from '@/configs/views';
import { Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useWindowSize } from '@/hooks/useWindowSize';
import TimelinePanel from '@/components/TimelinePanel';
import { AnimationScene } from '@/types/animation';
import SceneEditorPanel from '@/components/SceneEditorPanel';
import ContentEditorPanel from '@/components/ContentEditorPanel';
import CameraControlsPanel from '@/components/CameraControlsPanel';
import { cn } from '@/lib/utils'; // <-- IMPORT cn UTILITY

const generateId = () => `scene_${Math.random().toString(36).substr(2, 9)}`;

// Default scene controls values
const DEFAULT_SCENE_CONTROLS = {
  cameraPosition: [0, 0, 2] as [number, number, number],
  cameraTarget: [0, 0, 0] as [number, number, number],
  cameraFov: 50,
  modelPosition: [0, 0, 0] as [number, number, number],
  modelRotation: [0, 0, 0] as [number, number, number],
  modelScale: 1,
  ambientIntensity: 0.7,
  directionalIntensity: 0.1,
  directionalPosition: [2, 3, 4] as [number, number, number],
  environmentIntensity: 0.2,
  screenReflection: true,
};

// Define the default "spin" scene
const defaultScene: AnimationScene = {
  id: generateId(),
  name: 'Default Spin',
  duration: 3,
  animationType: 'spin',
};

const DEFAULT_TOTAL_DURATION = 10;

export default function App() {
  const { uploadedFileUrl, uploadedFileType, videoDuration, handleFileUpload } =
    useUploadedFile();
  const sceneRef = useRef<SceneApi>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const { selectedModel, setModel, allModels } = useModelSwitcher();
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [showViews, setShowViews] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [showTimeline, setShowTimeline] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasFinished, setHasFinished] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [animationScenes, setAnimationScenes] = useState<AnimationScene[]>([
    defaultScene,
  ]);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(
    defaultScene.id
  );
  const [totalVideoDuration, setTotalVideoDuration] = useState(10);

  // Scene controls state (remains the same)
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>(
    DEFAULT_SCENE_CONTROLS.cameraPosition
  );
  const [cameraTarget, setCameraTarget] = useState<[number, number, number]>(
    DEFAULT_SCENE_CONTROLS.cameraTarget
  );
  const [cameraFov, setCameraFov] = useState(DEFAULT_SCENE_CONTROLS.cameraFov);
  const [modelPosition, setModelPosition] = useState<[number, number, number]>(
    DEFAULT_SCENE_CONTROLS.modelPosition
  );
  const [modelRotation, setModelRotation] = useState<[number, number, number]>(
    DEFAULT_SCENE_CONTROLS.modelRotation
  );
  const [modelScale, setModelScale] = useState(DEFAULT_SCENE_CONTROLS.modelScale);
  const [ambientIntensity, setAmbientIntensity] = useState(
    DEFAULT_SCENE_CONTROLS.ambientIntensity
  );
  const [directionalIntensity, setDirectionalIntensity] = useState(
    DEFAULT_SCENE_CONTROLS.directionalIntensity
  );
  const [directionalPosition, setDirectionalPosition] = useState<
    [number, number, number]
  >(DEFAULT_SCENE_CONTROLS.directionalPosition);
  const [environmentIntensity, setEnvironmentIntensity] = useState(
    DEFAULT_SCENE_CONTROLS.environmentIntensity
  );
  const [screenReflection, setScreenReflection] = useState(
    DEFAULT_SCENE_CONTROLS.screenReflection
  );

  // useEffect and handlers remain the same
  useEffect(() => {
    // Check if uploadedFileType is 'video' AND videoDuration is a valid number > 0
    if (uploadedFileType === 'video' && videoDuration !== null && videoDuration > 0) {
      setTotalVideoDuration(videoDuration);
      setShowTimeline(true); // Show timeline for video
    } else {
      // If it's an image, no file, or video duration is invalid/zero
      setTotalVideoDuration(DEFAULT_TOTAL_DURATION); // Reset to default 10
      // Decide if timeline should hide based on file type, not just duration
      if (uploadedFileType !== 'video') {
         setShowTimeline(false); // Hide timeline if not a video
      }
    }
  }, [uploadedFileType, videoDuration]);

  const handleCapture = () => {
    setIsLoading(true);
    try {
      const dataUrl = sceneRef.current?.capture(aspectRatio);
      if (dataUrl) {
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
  };

  const handlePresetClick = (view: typeof presetViews[number]) => {
    sceneRef.current?.setView(view.position, view.target);
    setShowViews(false);
  };

  const handleAddScene = () => {
    const newScene: AnimationScene = {
      id: generateId(),
      name: `Scene ${animationScenes.length + 1}`,
      duration: 3,
      animationType: 'hold',
    };
    setAnimationScenes([...animationScenes, newScene]);
    setSelectedSceneId(newScene.id);
  };

  const handleUpdateScene = (
    sceneId: string,
    updates: Partial<AnimationScene>
  ) => {
    setAnimationScenes((currentScenes) =>
      currentScenes.map((scene) =>
        scene.id === sceneId ? { ...scene, ...updates } : scene
      )
    );
  };

  const handleDeleteScene = (sceneId: string) => {
    if (animationScenes.length <= 1) return;
    const deletedIndex = animationScenes.findIndex((s) => s.id === sceneId);
    setAnimationScenes((currentScenes) =>
      currentScenes.filter((scene) => scene.id !== sceneId)
    );
    if (selectedSceneId === sceneId) {
      if (deletedIndex === 0 && animationScenes.length > 1) {
        setSelectedSceneId(animationScenes[1].id);
      } else if (deletedIndex > 0) {
        setSelectedSceneId(animationScenes[deletedIndex - 1].id);
      } else {
        setSelectedSceneId(null);
      }
    }
  };

  const selectedScene = animationScenes.find(
    (s) => s.id === selectedSceneId
  );

  const handleTogglePlay = () => {
    if (!isPlaying && hasFinished) {
      setCurrentTime(0);
      setHasFinished(false);
    }
    setIsPlaying(!isPlaying);
  };

  const getFrameStyle = () => {
    if (aspectRatio === '16:9') return { width: '100%', height: '100%' };
    if (windowWidth === 0 || windowHeight === 0)
      return { width: '100%', height: '100%' };
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
      width: `${Math.round(frameWidth)}px`,
      height: `${Math.round(frameHeight)}px`,
    };
  };

  const handleResetSceneControls = () => {
    setCameraPosition(DEFAULT_SCENE_CONTROLS.cameraPosition);
    setCameraTarget(DEFAULT_SCENE_CONTROLS.cameraTarget);
    setCameraFov(DEFAULT_SCENE_CONTROLS.cameraFov);
    setModelPosition(DEFAULT_SCENE_CONTROLS.modelPosition);
    setModelRotation(DEFAULT_SCENE_CONTROLS.modelRotation);
    setModelScale(DEFAULT_SCENE_CONTROLS.modelScale);
    setAmbientIntensity(DEFAULT_SCENE_CONTROLS.ambientIntensity);
    setDirectionalIntensity(DEFAULT_SCENE_CONTROLS.directionalIntensity);
    setDirectionalPosition(DEFAULT_SCENE_CONTROLS.directionalPosition);
    setEnvironmentIntensity(DEFAULT_SCENE_CONTROLS.environmentIntensity);
    setScreenReflection(DEFAULT_SCENE_CONTROLS.screenReflection);
  };

  const frameStyle = getFrameStyle();
  return (
    <div className="w-full h-screen bg-white relative overflow-hidden flex items-center justify-center">
      <div style={frameStyle} className="">
        <Scene
          ref={sceneRef}
          textureUrl={uploadedFileUrl}
          uploadedFileType={uploadedFileType}
          model={selectedModel}
          backgroundColor={backgroundColor}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          isScrubbing={isScrubbing}
          scenes={animationScenes}
          currentTime={currentTime}
          setCurrentTime={setCurrentTime}
          setHasFinished={setHasFinished}
          totalVideoDuration={totalVideoDuration}
          cameraPosition={cameraPosition}
          cameraTarget={cameraTarget}
          cameraFov={cameraFov}
          modelPosition={modelPosition}
          modelRotation={modelRotation}
          modelScale={modelScale}
          ambientIntensity={ambientIntensity}
          directionalIntensity={directionalIntensity}
          directionalPosition={directionalPosition}
          environmentIntensity={environmentIntensity}
          screenReflection={screenReflection}
        />
      </div>

      {/* Top-Right Container */}
      <div className="fixed top-4 right-7 z-10 flex items-end gap-3">
        <BackgroundPicker
          color={backgroundColor}
          onChange={setBackgroundColor}
        />
        <ModelSelector
          allModels={allModels}
          selectedModel={selectedModel}
          onModelSelect={handleModelChange}
        />
        <CameraControlsPanel
          cameraPosition={cameraPosition}
          cameraTarget={cameraTarget}
          cameraFov={cameraFov}
          modelPosition={modelPosition}
          modelRotation={modelRotation}
          modelScale={modelScale}
          ambientIntensity={ambientIntensity}
          directionalIntensity={directionalIntensity}
          directionalPosition={directionalPosition}
          environmentIntensity={environmentIntensity}
          screenReflection={screenReflection}
          onCameraPositionChange={setCameraPosition}
          onCameraTargetChange={setCameraTarget}
          onCameraFovChange={setCameraFov}
          onModelPositionChange={setModelPosition}
          onModelRotationChange={setModelRotation}
          onModelScaleChange={setModelScale}
          onAmbientIntensityChange={setAmbientIntensity}
          onDirectionalIntensityChange={setDirectionalIntensity}
          onDirectionalPositionChange={setDirectionalPosition}
          onEnvironmentIntensityChange={setEnvironmentIntensity}
          onScreenReflectionChange={setScreenReflection}
          onReset={handleResetSceneControls}
          // --- Pass presets here if you integrate into CameraControlsPanel ---
          // presetViews={presetViews}
          // onSetPresetView={handleSetPresetView}
        />

        {/* --- MODIFIED: Preset Views Dropdown --- */}
        <div className="relative">
          <Button
            onClick={() => setShowViews(!showViews)}
            variant="primary" // Will use new dark glassy blue
            size="default"
            tooltip="Preset Views"
            tooltipSide="bottom"
            isActive={showViews}
          >
            <Crosshair className="h-6 w-6 text-white" />
          </Button>
          {showViews && (
            <div
              // Apply dark panel styles
              className="absolute top-full right-0 mt-2 w-48 rounded-lg border shadow-xl bg-linear-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 backdrop-blur-xl z-20 p-1.5"
              style={{ animation: 'slideUp 0.2s ease-out' }}
            >
              <style>{`
                  @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                `}</style>
              <div className="space-y-1">
                {presetViews.map((view) => (
                  <Button
                    key={view.name}
                    onClick={() => handlePresetClick(view)}
                    variant="menu-item" // Will use new dark menu-item style
                    size="menu-item"
                    className="w-full" // Removed border classes
                  >
                    {view.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* --- END MODIFICATION --- */}
      </div>

      {/* Bottom-Right Container */}
      <div className="fixed bottom-4 right-7 z-10">
        <div className="flex flex-row items-center gap-3">
          <CaptureControls
            onCapture={handleCapture}
            isLoading={isLoading}
            aspectRatio={aspectRatio}
            onAspectRatioChange={setAspectRatio}
            showTimeline={showTimeline}
            onToggleTimeline={() => setShowTimeline(!showTimeline)}
          />
          <FileUpload
            onFileUpload={handleFileUpload}
            previewUrl={uploadedFileUrl}
          />
        </div>
      </div>

      {/* Modals and Panels */}
      {capturedImageUrl && (
        <PreviewModal
          imageUrl={capturedImageUrl}
          onClose={() => setCapturedImageUrl(null)}
        />
      )}

      {/* Bottom-Left Container */}
      <div className="fixed bottom-4 left-4 z-20 flex flex-col-reverse items-end gap-2">
        <ContentEditorPanel
          isVisible={showTimeline}
          totalVideoDuration={totalVideoDuration}
          setTotalVideoDuration={setTotalVideoDuration}
        />
        {selectedScene && (
          <SceneEditorPanel
            isVisible={showTimeline}
            selectedScene={selectedScene}
            onUpdateScene={handleUpdateScene}
            sceneRef={sceneRef}
            onDeleteScene={handleDeleteScene}
            sceneCount={animationScenes.length}
            scenes={animationScenes}
            onReorderScenes={setAnimationScenes}
          />
        )}
      </div>

      {/* Bottom-Center Container */}
      <TimelinePanel
        isVisible={showTimeline}
        scenes={animationScenes}
        onAddScene={handleAddScene}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        currentTime={currentTime}
        selectedSceneId={selectedSceneId}
        onSelectScene={setSelectedSceneId}
        totalVideoDuration={totalVideoDuration}
        uploadedFileType={uploadedFileType}
        setCurrentTime={setCurrentTime}
        setIsPlaying={setIsPlaying}
        isScrubbing={isScrubbing}
        setIsScrubbing={setIsScrubbing}
      />
    </div>
  );
}