// Hook for capturing the current scene as an image and managing preview state.

import { useState, RefObject } from "react";
import { SceneApi } from "@/components/Scene/Scene";

export const useCapture = (
  sceneRef: RefObject<SceneApi | null>,
  aspectRatio: string
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);

    //Handles capturing the current scene as an image
  const handleCapture = () =>{
    if(!sceneRef.current) return;
    setIsLoading(true);

    try{
        const dataUrl = sceneRef.current.capture(aspectRatio);
        if (dataUrl){
            setCapturedImageUrl(dataUrl);
        }
    }catch(error){
        console.log('Error during capture', error);
    } finally{
        setIsLoading(false);
    }
  }

  // Handles closing the captured image preview
  const handleClosePreview = () =>{
    setCapturedImageUrl(null);
  }

  return{
    isLoading, 
    capturedImageUrl,
    handleCapture,
    handleClosePreview
  };
};
