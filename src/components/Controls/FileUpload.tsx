import React, { useRef, useEffect, useCallback } from 'react';
import { Upload, X, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

// Props for file upload component
interface FileUploadProps {
  onFileUpload: (file: File | null) => void; // Callback for file upload or removal
  previewUrl: string | null; // Preview URL for uploaded file
}

// Maximum allowed file size (25 MB)
const MAX_FILE_SIZE = 25 * 1024 * 1024;

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, previewUrl }) => {
  // State for drag-and-drop UI
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  // Ref for file input element
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset file input if preview is cleared
  useEffect(() => {
    if (previewUrl === null && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl]);

  // Validate and handle file upload
  const handleFileChange = useCallback((file: File | null) => {
    if (file && file.size > MAX_FILE_SIZE) {
      toast.error('File is too large. Please upload a file 25MB or less.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    if (
      file &&
      (file.type.startsWith('image/') || file.type.startsWith('video/'))
    ) {
      onFileUpload(file); // Forward valid file to parent
    } else if (file === null) {
      onFileUpload(null); // Notify parent to clear
    } else if (file) {
      toast.error('Please upload a valid image or video file.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [onFileUpload]);

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handleFileChange(file);
  };

  // Handle file drop event
  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0] ?? null;
    handleFileChange(file);
  }, [handleFileChange]);

  // Handle drag over event
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  // Handle drag leave event
  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      e.relatedTarget &&
      (e.currentTarget as Node).contains(e.relatedTarget as Node)
    ) {
      return;
    }
    setIsDragging(false);
  }, []);

  // Add/remove drag event listeners for drag-and-drop
  useEffect(() => {
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [handleDrop, handleDragOver, handleDragLeave]);

  // Remove uploaded file
  const handleRemove = () => {
    onFileUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Open file picker dialog
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      {/* Drag-and-drop overlay UI */}
      {isDragging && (
        <div className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-linear-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-md"></div>
          <div className="flex flex-col items-center gap-4">
            <UploadCloud size={96} className="relative z-10 text-white" />
            <span className="relative z-10 text-2xl font-medium text-white">
              Drop file to upload
            </span>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Upload/remove button UI */}
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
            tooltipSide="top"
          >
            <X size={24} />
          </Button>
        ) : (
          <Button
            onClick={handleClick}
            variant="primary"
            size="default"
            tooltip="Upload file"
            tooltipSide="top"
          >
            <Upload size={24} />
          </Button>
        )}
      </div>
    </>
  );
};

export default FileUpload;