'use client';
import FileUpload from '@/components/FileUpload';
import { useUploadedFile } from '@/hooks/useUploadedFile';
import Scene, { SceneApi } from '@/components/Scene';
import CaptureControls from '@/components/CaptureControls';
import { useRef, useState, useEffect } from 'react';
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
import { useScene } from '@/contexts/SceneContext'; // --- IMPORT ---
import { useAnimation } from '@/contexts/AnimationContext'; // --- IMPORT ---


const DEFAULT_TOTAL_DURATION = 10;

export default function App() {
  // --- Core Hooks ---
  const { sceneControls, dispatchSceneControls } = useScene();
  const {
    animationScenes,
    setAnimationScenes,
    selectedSceneId,
    setSelectedSceneId,
    totalVideoDuration,
    setTotalVideoDuration,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    hasFinished,
    setHasFinished,
    isScrubbing,
    setIsScrubbing,
  } = useAnimation();

  // --- Destructure sceneControls for easier prop-passing ---
  const {
    cameraPosition,
    cameraTarget,
    cameraFov,
    modelPosition,
    modelRotation,
    modelScale,
    ambientIntensity,
    directionalIntensity,
    directionalPosition,
    environmentIntensity,
    screenReflection,
  } = sceneControls;

  // --- Local UI State (Not part of global context) ---
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
  const [wrapperBg, setWrapperBg] = useState('bg-white');
  const isResetting = useRef(false);
  const prevUploadedFileTypeRef = useRef<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showBrowserWarning, setShowBrowserWarning] = useState(false);

  useEffect(() => {
    const prevFileType = prevUploadedFileTypeRef.current;
    if (uploadedFileType === 'video' && videoDuration !== null && videoDuration > 0) {
      setTotalVideoDuration(videoDuration);
      setShowTimeline(true);
    } else if (prevFileType === 'video' && uploadedFileType !== 'video') {
      setTotalVideoDuration(DEFAULT_TOTAL_DURATION);
    }
    prevUploadedFileTypeRef.current = uploadedFileType;
  }, [uploadedFileType, videoDuration, setTotalVideoDuration]);

  useEffect(() => {
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
      }
    } catch (error) {
      console.error('Error during capture:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (aspectRatio === '16:9') {
      setWrapperBg('bg-white');
    } else {
      setWrapperBg('bg-gray-950');
    }
  }, [aspectRatio]);

  const handleModelChange = (modelName: string) => {
    setModel(modelName);
  };

  const handlePresetClick = (view: typeof presetViews[number]) => {
    sceneRef.current?.setView(view.position, view.target);
    dispatchSceneControls({
      type: 'SET_PRESET',
      payload: {
        position: view.position as [number, number, number],
        target: view.target as [number, number, number],
      },
    });
    setShowViews(false);
  };

  const currentState: SceneState = {
    position: cameraPosition,
    target: cameraTarget,
    fov: cameraFov,
    modelPosition: modelPosition,
    modelRotation: modelRotation,
    modelScale: modelScale,
  };

  const handleAddScene = () => {
    const newScene: AnimationScene = {
      id: `scene_${Math.random().toString(36).substr(2, 9)}`, // Use inline ID
      name: `Scene ${animationScenes.length + 1}`,
      duration: 3,
      animationType: 'hold',
      startView: currentState,
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
      dispatchSceneControls({ type: 'SET_VIEW', payload: selectedScene.startView });
    }
  }, [selectedScene, isPlaying, isScrubbing, dispatchSceneControls]);

  const handleTogglePlay = () => {
    if (isRecording) return;
    if (!isPlaying && hasFinished) {
      setCurrentTime(0);
      setHasFinished(false);
    }
    setIsPlaying(!isPlaying);
  };

  const handleExport = () => {
    if (isRecording) return;
    const mimeType = 'video/webm; codecs=vp9';
    if (
      typeof MediaRecorder === 'undefined' ||
      !MediaRecorder.isTypeSupported(mimeType)
    ) {
      setShowBrowserWarning(true);
      return;
    }
    setShowExportConfirm(true);
  };

  const handleConfirmExport = () => {
    if (!sceneRef.current || isRecording) return;
    setShowExportConfirm(false);
    setIsRecording(true);
    setIsPlaying(false);
    setCurrentTime(0.1);
    setHasFinished(false);
    setTimeout(() => {
      sceneRef.current?.startRecording(aspectRatio);
      setCurrentTime(0.1);
      setIsPlaying(true);
    }, 100);
  };

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

  const handleResetSceneControls = () => {
    isResetting.current = true;
    dispatchSceneControls({ type: 'RESET' });
    if (sceneRef.current) {
      sceneRef.current.setView(
        sceneControls.cameraPosition, // Read default from controls
        sceneControls.cameraTarget
      );
    }
    setTimeout(() => {
      isResetting.current = false;
    }, 600);
  };

  const frameStyle = getFrameStyle();

  // Throttle live camera updates to prevent excessive re-renders
  const throttledUpdateRef = useRef<NodeJS.Timeout | null>(null);

  const handleLiveCameraChange = (newState: SceneState) => {
    if (isResetting.current) return;

    // Clear any pending update
    if (throttledUpdateRef.current) {
      clearTimeout(throttledUpdateRef.current);
    }

    // Schedule update for after render cycle, throttled
    throttledUpdateRef.current = setTimeout(() => {
      dispatchSceneControls({ type: 'SET_VIEW', payload: newState });
      throttledUpdateRef.current = null;
    }, 16); // ~60fps throttle
  };

  // Cleanup throttle timer on unmount
  useEffect(() => {
    return () => {
      if (throttledUpdateRef.current) {
        clearTimeout(throttledUpdateRef.current);
      }
    };
  }, []);

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
          onLiveCameraChange={handleLiveCameraChange}
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

        <CameraControlsPanel onReset={handleResetSceneControls} />

        <div className="relative">
          <Button
            onClick={() => setShowViews(!showViews)}
            variant="primary"
            size="default"
            tooltip="Preset Views"
            tooltipSide="bottom"
            isActive={showViews}
          >
            <Crosshair className="h-6 w-6 text-white" />
          </Button>
          {showViews && (
            <div
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
      {/* ... (Rest of the JSX remains unchanged) ... */}
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
        onExport={handleExport}
        isRecording={isRecording}
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