import { useState, useEffect } from "react";
import { useTexture } from "@react-three/drei";

export function useUploadedFile() {
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileType, setUploadedFileType] = useState<'image' | 'video' | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [internalFile, setInternalFile] = useState<File | null>(null); // Keep track of the file itself

  const handleFileUpload = (file: File | null) => {
    // Revoke previous URL if it exists, before setting new state
    if (uploadedFileUrl) {
       URL.revokeObjectURL(uploadedFileUrl);
       if (uploadedFileType === 'image') {
         useTexture.clear(uploadedFileUrl);
       }
    }

    setInternalFile(file); // Update internal file state

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
          // No need to revoke here, URL.createObjectURL creates a *new* reference
          setVideoDuration(video.duration);
        };
        video.onerror = () => {
          console.error("Error loading video metadata.");
          setVideoDuration(null); // Reset duration on error
        };
        video.src = fileUrl; // Use the same URL created above
      } else {
        // Invalid file type
        setUploadedFileUrl(null);
        setUploadedFileType(null);
        setVideoDuration(null);
        URL.revokeObjectURL(fileUrl); // Clean up the URL if type is invalid
        setInternalFile(null); // Reset internal file state too
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
         console.log("Cleaning up URL:", currentUrl);
         URL.revokeObjectURL(currentUrl);
         if (currentType === 'image') {
           useTexture.clear(currentUrl); // Clear drei cache if it was an image
         }
      }
    };
  }, [uploadedFileUrl, uploadedFileType]); // Re-run if URL or type changes

  return { uploadedFileUrl, uploadedFileType, videoDuration, handleFileUpload };
}