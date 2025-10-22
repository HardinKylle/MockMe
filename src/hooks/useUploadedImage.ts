import { useState, useEffect } from "react";

export function useUploadedImage() {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const handleImageUpload = (file: File | null) => {
   //Clean up the previous object URL to prevent memory leaks
    if (uploadedImageUrl) {
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

  //The cleanup effect is also inside the hook
  useEffect(() => {
    // This is the cleanup function that runs when the hook is "destroyed"
    // or when uploadedImageUrl changes.
    return () => {
      if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl);
      }
    };
  }, [uploadedImageUrl]); // Effect depends on the URL

  // 4. Return the state and the function for your components to use
  return { uploadedImageUrl, handleImageUpload };
}
