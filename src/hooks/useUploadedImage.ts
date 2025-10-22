import { useState, useEffect } from "react";

export function useUploadedImage() {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const handleImageUpload = (file: File | null) => {
    // if (uploadedImageUrl) {
    //   URL.revokeObjectURL(uploadedImageUrl);
    // }

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
    // This cleanup function will run when uploadedImageUrl changes
    // or when the hook unmounts. This is the *correct* place.
    return () => {
      if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl);
      }
    };
  }, [uploadedImageUrl]); // Effect depends on the URL

  // 4. Return the state and the function for your components to use
  return { uploadedImageUrl, handleImageUpload };
}
