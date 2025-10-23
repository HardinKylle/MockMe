import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, UploadCloud } from 'lucide-react';

interface ImageUploadProps {
    OnImageUpload: (file: File | null) => void;
    previewUrl: string | null;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ OnImageUpload, previewUrl }) => {
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      OnImageUpload(file); // Forward the file to the parent hook
    } else if (file === null) {
      OnImageUpload(null); // Notify parent to clear
    } else {
      alert('Please upload a valid image file.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handleFileChange(file);
  };

  useEffect(() => {
    // We use 'window' to capture events anywhere on the page
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    // Cleanup function to remove listeners when component unmounts
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // Check if files were dropped
    const file = e.dataTransfer?.files?.[0] ?? null;
    handleFileChange(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // This check prevents flickering when dragging over child elements
    if (e.relatedTarget && (e.currentTarget as Node).contains(e.relatedTarget as Node)) {
      return;
    }

    setIsDragging(false);
  };

  const handleRemove = () => {
    OnImageUpload(null); // Notify parent to clear
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
     {isDragging && (
        <div className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none">
          {/* Blurred background overlay */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md"></div>

          <UploadCloud
            size={96} 
            className="relative z-10 text-white"
          />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
     <div>
        {/* We now use the 'previewUrl' prop instead of local state */}
        {previewUrl ? (
          <div className="relative group">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="bg-red-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:bg-red-600 transform transition-all duration-200 hover:scale-105"
              title="Remove image"
            >
              <X size={24} />
            </button>
            {/* Tooltip... */}
          </div>
        ) : (
          <div className="relative group">
            <button
              onClick={handleClick}
              className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:bg-blue-600 transform transition-all duration-200 hover:scale-105"
              title="Upload image"
            >
              <Upload size={24} />
            </button>
            {/* Tooltip... */}
          </div>
        )}
      </div>
    </>
  );
};

export default ImageUpload;