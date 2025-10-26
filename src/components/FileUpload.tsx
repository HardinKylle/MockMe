import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FileUploadProps {
  onFileUpload: (file: File | null) => void;
  previewUrl: string | null;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB max size

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, previewUrl }) => {
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (previewUrl === null && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl]);

  const handleFileChange = (file: File | null) => {
    if (file && file.size > MAX_FILE_SIZE) {
      alert(`File is too large. Please upload a file 25MB or less.`);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear the input
      }
      return;
    }

    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      onFileUpload(file); // Forward the file to the parent hook
    } else if (file === null) {
      onFileUpload(null); // Notify parent to clear
    } else if (file) {
      alert('Please upload a valid image or video file.');
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear the input
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handleFileChange(file);
  };

  useEffect(() => {
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
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
    const file = e.dataTransfer?.files?.[0] ?? null;
    handleFileChange(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.relatedTarget && (e.currentTarget as Node).contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragging(false);
  };

  const handleRemove = () => {
    onFileUpload(null); // Notify parent to clear
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
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md"></div>
          <UploadCloud size={96} className="relative z-10 text-white" />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleInputChange}
        className="hidden"
      />
      <div>
        {previewUrl ? (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            variant="danger"
            size="default"
            tooltip="Remove file"
          >
            <X size={24} />
          </Button>
        ) : (
          <Button
            onClick={handleClick}
            variant="primary"
            size="default"
            tooltip="Upload file"
          >
            <Upload size={24} />
          </Button>
        )}
      </div>
    </>
  );
};

export default FileUpload;