// Hook for managing uploaded image files and their URLs.

import { useState, useEffect } from "react";
import { useTexture } from "@react-three/drei";

export function useUploadedImage() {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  // Handles image upload and sets state
  const handleImageUpload = (file: File | null) => {
    // Clean up the previous object URL to prevent memory leaks
    if (uploadedImageUrl) {
      useTexture.clear(uploadedImageUrl);
      URL.revokeObjectURL(uploadedImageUrl);
    }

    if (file) {
      // Create a new temporary URL for the selected file
      const imageUrl = URL.createObjectURL(file);
      setUploadedImageUrl(imageUrl);
    } else {
      // User cleared the image
      setUploadedImageUrl(null);
    }
  };

  // Cleanup effect for when the hook is destroyed or URL changes
  useEffect(() => {
    return () => {
      if (uploadedImageUrl) {
        useTexture.clear(uploadedImageUrl);
        URL.revokeObjectURL(uploadedImageUrl);
      }
    };
  }, [uploadedImageUrl]);

  // Return the state and the function for your components to use
  return { uploadedImageUrl, handleImageUpload };
}