// Hook for handling video export/recording logic and confirmation UI.

import { useState, RefObject } from "react";
import { toast } from "sonner";
import { SceneApi } from "@/components/Scene/Scene";

interface UseExportProps {
  sceneRef: RefObject<SceneApi | null>;
  aspectRatio: string;
  totalVideoDuration: number;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setIsExporting: (value: boolean) => void;
  isRecordingRef: React.MutableRefObject<boolean>;
}

export const useExport = ({
  sceneRef,
  aspectRatio,
  totalVideoDuration,
  setIsPlaying,
  setCurrentTime,
  setIsExporting,
  isRecordingRef,
}: UseExportProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showBrowserWarning, setShowBrowserWarning] = useState(false);

  // Checks browser support for VideoEncoder and shows confirmation or warnings
  const handleExport = () => {
    if (isRecording) return;
    if (typeof VideoEncoder === 'undefined') {
      setShowBrowserWarning(true);
      return;
    }
    setShowExportConfirm(true);
  };

  // Starts the offline WebCodecs export
  const handleConfirmExport = () => {
    if (!sceneRef.current || isRecording) return;

    setShowExportConfirm(false);
    setIsRecording(true);
    isRecordingRef.current = true;
    setIsPlaying(false);
    setCurrentTime(0);
    setIsExporting(true);

    sceneRef.current.startRecording(aspectRatio, totalVideoDuration, () => {
      // onComplete callback — export loop has finished
      setIsExporting(false);
      setIsRecording(false);
      isRecordingRef.current = false;
      setCurrentTime(0);
      toast.success('Video exported!');
    });
  };

  // When user cancels export confirmation
  const handleCancelExport = () => {
    setShowExportConfirm(false);
  };

  return {
    isRecording,
    showExportConfirm,
    showBrowserWarning,
    setShowBrowserWarning,
    handleExport,
    handleConfirmExport,
    handleCancelExport
  };
};
