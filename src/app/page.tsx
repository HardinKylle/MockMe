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
import { AnimationScene, SceneState } from '@/types/animation';
import SceneEditorPanel from '@/components/SceneEditorPanel';
import ContentEditorPanel from '@/components/ContentEditorPanel';
import CameraControlsPanel from '@/components/CameraControlsPanel';

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

const getCurrentSceneState = (): AnimationScene['startView'] => ({
  position: DEFAULT_SCENE_CONTROLS.cameraPosition,
  target: DEFAULT_SCENE_CONTROLS.cameraTarget,
  fov: DEFAULT_SCENE_CONTROLS.cameraFov,
  modelPosition: DEFAULT_SCENE_CONTROLS.modelPosition,
  modelRotation: DEFAULT_SCENE_CONTROLS.modelRotation,
  modelScale: DEFAULT_SCENE_CONTROLS.modelScale,
});

// Define the default "spin" scene
const defaultScene: AnimationScene = {
  id: generateId(),
  name: 'Default Spin',
  duration: 3,
  animationType: 'spin',
  // Note: 'spin' is a preset, but other types like 'hold' 
  // will rely on startView. Let's add it for consistency.
  startView: getCurrentSceneState(),
}

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
  const [wrapperBg, setWrapperBg] = useState('bg-white');
  const isResetting = useRef(false);
  const prevUploadedFileTypeRef = useRef<string | null>(null);
  const [animationScenes, setAnimationScenes] = useState<AnimationScene[]>([
    defaultScene,
  ]);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(
    defaultScene.id
  );
  const [totalVideoDuration, setTotalVideoDuration] = useState(10);

  const [isRecording, setIsRecording] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showBrowserWarning, setShowBrowserWarning] = useState(false);
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

  useEffect(() => {
    const prevFileType = prevUploadedFileTypeRef.current;

    // Case 1: A video is uploaded.
    // Set duration to the video's length.
    if (uploadedFileType === 'video' && videoDuration !== null && videoDuration > 0) {
      setTotalVideoDuration(videoDuration);
      setShowTimeline(true); // Show timeline for video
    }
    // Case 2: A video was *just* removed.
    // (The previous type was 'video', but the current one is not).
    else if (prevFileType === 'video' && uploadedFileType !== 'video') {
      setTotalVideoDuration(DEFAULT_TOTAL_DURATION); // Reset to 10
    }

    // Finally, update the ref to store the current type for the next run.
    prevUploadedFileTypeRef.current = uploadedFileType;

  }, [uploadedFileType, videoDuration]);

  useEffect(() => {
    // When animation finishes AND we are recording, stop the recording.
    if (hasFinished && isRecording) {
      sceneRef.current?.stopRecording();
      setIsRecording(false);
    }
  }, [hasFinished, isRecording]);

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

  useEffect(() => {
    if (aspectRatio === '16:9') {
      // When 16:9, the background should be white
      setWrapperBg('bg-white');

    } else {
      // For any other ratio, show the gray letterboxing
      setWrapperBg('bg-gray-950');
    }
  }, [aspectRatio]);

  const handleModelChange = (modelName: string) => {
    setModel(modelName);
  };

  const handlePresetClick = (view: typeof presetViews[number]) => {
    sceneRef.current?.setView(view.position, view.target);
    // --- ADDED: Also update inspection state ---
    setCameraPosition(view.position as [number, number, number]);
    setCameraTarget(view.target as [number, number, number]);
    // --- END ADDITION ---
    setShowViews(false);
  };

  const handleAddScene = () => {
    const newScene: AnimationScene = {
      id: generateId(),
      name: `Scene ${animationScenes.length + 1}`,
      duration: 3,
      animationType: 'hold',
      // --- THIS IS THE KEY ---
      // Capture the current state of *all* controls
      startView: {
        position: cameraPosition,
        target: cameraTarget,
        fov: cameraFov,
        modelPosition: modelPosition,
        modelRotation: modelRotation,
        modelScale: modelScale,
      },
      // --- END OF CHANGE ---
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

  useEffect(() => {
    if (selectedScene && selectedScene.startView && !isPlaying && !isScrubbing) {
      // Find the scene's starting state
      const stateToLoad = selectedScene.startView;

      // Update all the global control sliders
      setCameraPosition(stateToLoad.position);
      setCameraTarget(stateToLoad.target);
      setCameraFov(stateToLoad.fov);
      setModelPosition(stateToLoad.modelPosition);
      setModelRotation(stateToLoad.modelRotation);
      setModelScale(stateToLoad.modelScale);
    }
  }, [selectedScene, isPlaying, isScrubbing]);

  const handleTogglePlay = () => {
    if (isRecording) return; // Don't allow user to pause during recording
    if (!isPlaying && hasFinished) {
      setCurrentTime(0);
      setHasFinished(false);
    }

    // --- THIS IS THE FIX ---
    // Just toggle the state. No more manual sync.
    // The Scene component will handle the rest.
    setIsPlaying(!isPlaying);
    // --- END OF FIX ---
  };

  const handleExport = () => {
    if (isRecording) return;

    // --- ADD THIS BROWSER CHECK ---
    const mimeType = 'video/webm; codecs=vp9';
    if (
      typeof MediaRecorder === 'undefined' ||
      !MediaRecorder.isTypeSupported(mimeType)
    ) {
      // If not supported, show the warning modal and stop.
      setShowBrowserWarning(true);
      return;
    }
    // --- END OF CHECK ---

    // If supported, proceed as normal.
    setShowExportConfirm(true);
  };

  // --- ADDED: This function contains the actual export logic ---
  const handleConfirmExport = () => {
    if (!sceneRef.current || isRecording) return;

    setShowExportConfirm(false); // Close the pop-up
    setIsRecording(true);
    setIsPlaying(false); // Ensure paused
    setCurrentTime(0.1);   // Reset time to 0.1  // Reset time
    setHasFinished(false);

    // Give React a moment to update state before starting
    setTimeout(() => {
      // --- MODIFIED: Pass the aspectRatio state ---
      sceneRef.current?.startRecording(aspectRatio);
      setCurrentTime(0.1); // Reset again just in case
      setIsPlaying(true);  // Start playback
    }, 100); // Small delay
  };

  // --- ADDED: Handler to cancel from the pop-up ---
  const handleCancelExport = () => {
    setShowExportConfirm(false);
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

  const currentState: SceneState = {
    position: cameraPosition,
    target: cameraTarget,
    fov: cameraFov,
    modelPosition: modelPosition,
    modelRotation: modelRotation,
    modelScale: modelScale,
  };

  const handleResetSceneControls = () => {
    // 1. Activate the lock
    isResetting.current = true;

    // 2. Set all the state to default
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

    // 3. Imperatively reset the 3D scene's camera
    if (sceneRef.current) {
      sceneRef.current.setView(
        DEFAULT_SCENE_CONTROLS.cameraPosition,
        DEFAULT_SCENE_CONTROLS.cameraTarget
      );
    }

    // 4. Release the lock *after* the camera animation has finished.
    // 100ms was too short. 600ms is much safer.
    setTimeout(() => {
      isResetting.current = false;
    }, 600); // <--- INCREASED TIMEOUT
  };

  // ...

  const frameStyle = getFrameStyle();

  // This function is now protected by the lock
  const handleLiveCameraChange = (newState: SceneState) => {
    // 5. Check the lock. If we are resetting, do nothing.
    if (isResetting.current) return;

    setCameraPosition(newState.position);
    setCameraTarget(newState.target);
    setCameraFov(newState.fov);
    setModelPosition(newState.modelPosition);
    setModelRotation(newState.modelRotation);
    setModelScale(newState.modelScale);
  };


  return (
    <div className={`w-full h-screen ${wrapperBg} relative overflow-hidden flex items-center justify-center transition-colors`}>
      <div style={frameStyle} className="">
        <Scene
          ref={sceneRef}
          textureUrl={uploadedFileUrl}
          uploadedFileType={uploadedFileType}
          model={selectedModel}
          backgroundColor={backgroundColor}
          isRecording={isRecording}
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
          // --- ADD THIS PROP ---
          onLiveCameraChange={handleLiveCameraChange}
        // --- END OF ADDITION ---
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
        />
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
                    variant="menu-item"
                    size="menu-item"
                    className="w-full"
                  >
                    {view.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
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

      {/* --- ADD THIS NEW BROWSER WARNING MODAL --- */}
      {showBrowserWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-lg border shadow-xl p-6 space-y-4 bg-linear-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50"
            style={{ animation: 'slideUp 0.2s ease-out' }}
          >
            <style>{`
                @keyframes slideUp {
                  from { opacity: 0; transform: translateY(10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
            <h3 className="text-xl font-semibold text-white">
              Browser Not Supported
            </h3>
            <p className="text-slate-300">
              Unfortunately, your browser does not support the required video
              codec (<code>video/webm; codecs=vp9</code>) for exporting this
              animation.
            </p>
            <p className="text-slate-300">
              Please try again using a different browser like{' '}
              <strong className="text-white">Google Chrome</strong> or{' '}
              <strong className="text-white">Microsoft Edge</strong> for full
              export functionality.
            </p>
            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                onClick={() => setShowBrowserWarning(false)}
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* --- END OF NEW MODAL --- */}

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
            currentState={currentState}
          />
        )}
      </div>

      {/* Bottom-Center Container */}
      <TimelinePanel
        isVisible={showTimeline}
        scenes={animationScenes}
        onAddScene={handleAddScene}
        onExport={handleExport} // --- ADDED ---
        isRecording={isRecording} // --- ADDED ---
        showExportConfirm={showExportConfirm}
        onConfirmExport={handleConfirmExport}
        onCancelExport={handleCancelExport}
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