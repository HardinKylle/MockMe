//  Hook for managing uploaded image/video files and their URLs.

import { useState, useEffect } from "react";
import { useTexture } from "@react-three/drei";

export function useUploadedFile() {
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileType, setUploadedFileType] = useState<'image' | 'video' | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  // Handles file upload and sets state
  const handleFileUpload = (file: File | null) => {
    // Revoke previous URL if it exists, before setting new state
    if (uploadedFileUrl) {
      URL.revokeObjectURL(uploadedFileUrl);
      if (uploadedFileType === 'image') {
        useTexture.clear(uploadedFileUrl);
      }
    }

    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setUploadedFileUrl(fileUrl); // Set URL immediately

      if (file.type.startsWith('image/')) {
        setUploadedFileType('image');
        setVideoDuration(null); // Ensure duration is null for images
      } else if (file.type.startsWith('video/')) {
        setUploadedFileType('video');
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          setVideoDuration(video.duration);
        };
        video.onerror = () => {
          setVideoDuration(null); // Reset duration on error
        };
        video.src = fileUrl; // Use the same URL created above
      } else {
        // Invalid file type
        setUploadedFileUrl(null);
        setUploadedFileType(null);
        setVideoDuration(null);
        URL.revokeObjectURL(fileUrl); // Clean up the URL if type is invalid
      }
    } else {
      // File is null (cleared)
      setUploadedFileUrl(null);
      setUploadedFileType(null);
      setVideoDuration(null); // Reset duration when cleared
    }
  };

  // Cleanup effect: Only responsible for revoking the URL when the component unmounts
  // or when uploadedFileUrl changes to a *new* valid URL (implicitly handled by handleFileUpload)
  useEffect(() => {
    const currentUrl = uploadedFileUrl; // Capture URL at the time effect runs
    const currentType = uploadedFileType;

    // Return the cleanup function
    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
        if (currentType === 'image') {
          useTexture.clear(currentUrl); // Clear drei cache if it was an image
        }
      }
    };
  }, [uploadedFileUrl, uploadedFileType]); // Re-run if URL or type changes

  return { uploadedFileUrl, uploadedFileType, videoDuration, handleFileUpload, setUploadedFileType, setUploadedFileUrl };
}