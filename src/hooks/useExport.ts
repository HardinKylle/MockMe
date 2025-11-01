import { useEffect, useState, RefObject } from "react";
import { SceneApi } from "@/components/Scene/Scene";

interface UseExportProps {
  sceneRef: RefObject<SceneApi | null>;
  aspectRatio: string;
  hasFinished: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setHasFinished: (hasFinished: boolean) => void;
}

export const useExport = ({
  sceneRef,
  aspectRatio,
  hasFinished,
  setIsPlaying,
  setCurrentTime,
  setHasFinished,
}: UseExportProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showBrowserWarning, setShowBrowserWarning] = useState(false);

  //Effect to stop recording when animation finishes
  useEffect(() => {
    if (hasFinished && isRecording) {
      sceneRef.current?.stopRecording();
      setIsRecording(false);
    }
  }, [hasFinished, isRecording, sceneRef]);

  // Checks browser support for MediaRecorder and shows confirmation or warnings
  const handleExport = () => {
    if (isRecording) return;
    const mimeType = "video/webm; codecs=vp9";
    if (
      typeof MediaRecorder === "undefined" ||
      !MediaRecorder.isTypeSupported(mimeType)
    ) {
      setShowBrowserWarning(true);
      return;
    }
    setShowExportConfirm(true);
  };

  //Starts the recording
  const handleConfirmExport = () => {
    if(!sceneRef.current || isRecording) return;

    setShowExportConfirm(false);
    setIsRecording(true);
    setIsPlaying(false);
    setCurrentTime(0.0);
    setHasFinished(false);

    //Delay before recording ( might check later that cause the bug in first frame recording)
    setTimeout(() => {
        sceneRef.current?.startRecording(aspectRatio);
        setCurrentTime(0.0);
        setIsPlaying(true);
    }, 100);
  };

  //When user cancel export 
  const handleCancelExport = () => {
    setShowExportConfirm(false);
  };

  return{
    isRecording,
    showExportConfirm,
    showBrowserWarning,
    setShowBrowserWarning,
    handleExport,
    handleConfirmExport,
    handleCancelExport
  }

};
