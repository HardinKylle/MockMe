import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';

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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
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
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
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