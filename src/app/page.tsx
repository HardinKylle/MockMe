'use client';

// Main entry point for the mock-me editor UI. Handles scene, timeline, panels, and global state.

import FileUpload from '@/components/Controls/FileUpload';
import Scene, { SceneApi } from '@/components/Scene/Scene';
import CaptureControls from '@/components/Controls/CaptureControls';
import { useRef, useState, useEffect } from 'react';
import PreviewModal from '@/components/Modals/PreviewModal';
import ModelSelector from '@/components/Controls/ModelSelector';
import BackgroundPicker from '@/components/Controls/BackgroundPicker';
import { useWindowSize } from '@/hooks/useWindowSize';
import TimelinePanel from '@/components/Timeline/TimelinePanel';
import SceneEditorPanel from '@/components/Panels/SceneEditorPanel';
import ContentEditorPanel from '@/components/Panels/ContentEditorPanel';
import CameraControlsPanel from '@/components/Controls/CameraControlsPanel';
import { useScene } from '@/contexts/SceneContext';
import { useAnimation, DEFAULT_TOTAL_DURATION } from '@/contexts/AnimationContext';
import { useCapture } from '@/hooks/useCapture'
import { useExport } from '@/hooks/useExport'
import { ViewPresetsPanel } from '@/components/Panels/ViewPresetsPanel';
import { BrowserWarningModal } from '@/components/Modals/BrowserWarningModal';
import { useSceneSync } from '@/hooks/useSceneSync'
import { useAsset } from '@/contexts/AssetContext';
import { HeaderAuth } from '@/components/Accounts/HeaderAuth';
import { SignInModal } from '@/components/Modals/SignInModal';
import { VerifyEmailPage } from '@/components/Accounts/VerifyEmailPage';
import { Loader } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MyProjectsModal } from '@/components/Modals/MyProjectsModal';

export default function App() {

  const { user, authLoading } = useAuth();

  // --- Core Hooks ---
  const { sceneControls, dispatchSceneControls } = useScene();
  const {
    totalVideoDuration,
    setTotalVideoDuration,
    setIsPlaying,
    setCurrentTime,
    isRecordingRef,
    setIsExporting,
  } = useAnimation();

  const sceneRef = useRef<SceneApi>(null);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [showTimeline, setShowTimeline] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const [wrapperBg, setWrapperBg] = useState('bg-white');
  const isResetting = useRef(false);
  const prevUploadedFileTypeRef = useRef<string | null>(null);

  const {
    isLoading,
    capturedImageUrl,
    handleCapture,
    handleClosePreview
  } = useCapture(sceneRef, aspectRatio);

  const {
    isRecording,
    showExportConfirm,
    showBrowserWarning,
    setShowBrowserWarning,
    handleExport,
    handleConfirmExport,
    handleCancelExport,
  } = useExport({
    sceneRef,
    aspectRatio,
    totalVideoDuration,
    setIsPlaying,
    setCurrentTime,
    setIsExporting,
    isRecordingRef,
  });

  const {
    handleFileUpload,
    uploadedFileUrl,
    uploadedFileType,
    videoDuration,
    selectedModel,
    setModel,
    allModels,
  } = useAsset();

  const { selectedScene, handleLiveCameraChange } = useSceneSync(isResetting);


  // Update timeline duration based on uploaded video
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

  // Change wrapper background based on aspect ratio
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

  // Calculates the frame style for the main scene area based on aspect ratio and window size
  const frameStyle = (windowWidth === 0 || windowHeight === 0) ? { width: '100%', height: '100%' } :
    (aspectRatio === '16:9') ? { width: '100%', height: '100%' } :
      (() => {
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
      })();
  // Resets camera/model controls to default
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

  if (authLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-900">
        <Loader className="h-10 w-10 animate-spin text-white" />
      </div>
    );
  }

  if (user && !user.emailVerified) {
    // User is logged in BUT has not clicked the email link.
    // Show them the "waiting room" page.
    return <VerifyEmailPage />;
  }


  return (
    <div className={`w-full h-screen ${wrapperBg} relative overflow-hidden flex items-center justify-center transition-colors`}>
      <div style={frameStyle} className="">
        <Scene
          ref={sceneRef}
          backgroundColor={sceneControls.backgroundColor}
          onLiveCameraChange={handleLiveCameraChange}
        />
      </div>

      {/* Top-Right Container */}
      <div className="fixed top-4 right-7 z-10 flex items-end gap-3">
        <BackgroundPicker
          color={sceneControls.backgroundColor}
          onChange={(newColor) =>
            dispatchSceneControls({
              type: 'UPDATE_RAW',
              payload: { backgroundColor: newColor },
            })
          }
        />
        <ModelSelector
          allModels={allModels}
          selectedModel={selectedModel}
          onModelSelect={handleModelChange}
        />

        <CameraControlsPanel onReset={handleResetSceneControls} />

        <ViewPresetsPanel sceneRef={sceneRef} />

        <HeaderAuth />

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

      {/* Export overlay */}
      {isRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-700/50 bg-slate-900/90 px-10 py-8 shadow-2xl">
            <Loader className="h-8 w-8 animate-spin text-white" />
            <div className="text-center">
              <p className="text-sm font-semibold text-white">Exporting video…</p>
              <p className="mt-1 text-xs text-slate-400">Please wait, do not close the tab</p>
            </div>
          </div>
        </div>
      )}

      <SignInModal />
      <MyProjectsModal />

      {/* Modals and Panels */}
      {capturedImageUrl && (
        <PreviewModal
          imageUrl={capturedImageUrl}
          onClose={handleClosePreview}
        />
      )}

      {showBrowserWarning && (
        <BrowserWarningModal onClose={() => setShowBrowserWarning(false)} />
      )}

      {/* Bottom-Left Container */}
      <div className="fixed bottom-4 left-4 z-20 flex flex-col-reverse items-end gap-2 max-h-[calc(100vh-2rem)] overflow-y-auto overflow-x-hidden">
        <ContentEditorPanel
          isVisible={showTimeline}
        />
        {selectedScene && (
          <SceneEditorPanel
            isVisible={showTimeline}
          />
        )}
      </div>

      {/* Bottom-Center Container */}
      <TimelinePanel
        isVisible={showTimeline}
        onExport={handleExport}
        isRecording={isRecording}
        showExportConfirm={showExportConfirm}
        onConfirmExport={handleConfirmExport}
        onCancelExport={handleCancelExport}
        uploadedFileType={uploadedFileType}
      />
    </div>
  );
}