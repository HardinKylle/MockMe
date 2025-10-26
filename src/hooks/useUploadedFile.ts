import { useState, useEffect } from "react";
import { useTexture } from "@react-three/drei";

export function useUploadedFile() {
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileType, setUploadedFileType] = useState<'image' | 'video' | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);

  const handleFileUpload = (file: File | null) => {
    if (file) {
      // Create a new temporary URL for the selected file
      const fileUrl = URL.createObjectURL(file);
      setUploadedFileUrl(fileUrl);

      if (file.type.startsWith('image/')) {
        setUploadedFileType('image');
        setVideoDuration(null);
      } else if (file.type.startsWith('video/')) {
        setUploadedFileType('video');
        
        // Create a temporary video element to get its duration
        const video = document.createElement('video');
        video.preload = 'metadata';
        
        video.onloadedmetadata = () => {
          // Once metadata is loaded, we have the duration
          setVideoDuration(video.duration);
        };
        
        video.src = fileUrl;

      } else {
        // Not an image or video, clear everything
        setUploadedFileUrl(null);
        setUploadedFileType(null);
        setVideoDuration(null);
      }

    } else {
      // User cleared the file
      setUploadedFileUrl(null);
      setUploadedFileType(null);
      setVideoDuration(null);
    }
  };

  // Cleanup effect
  useEffect(() => {
    // Capture the current values for the cleanup function
    const currentUrl = uploadedFileUrl;
    const currentType = uploadedFileType;

    return () => {
      if (currentUrl) {
        // If it was an image, tell drei to clear it from cache
        if (currentType === 'image') {
          useTexture.clear(currentUrl);
        }
        
        // In all cases, revoke the object URL to prevent memory leaks
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [uploadedFileUrl, uploadedFileType]); // Effect depends on the URL and type

  // Return the state and the function for components to use
  return { uploadedFileUrl, uploadedFileType, videoDuration, handleFileUpload };
}