import React, { useRef, useEffect, useCallback } from 'react';
import { Upload, X } from 'lucide-react';
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

  // Remove uploaded file
  const handleRemove = () => {
    onFileUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
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
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <Button
              variant="primary"
              size="default"
              tooltip="Upload file"
              tooltipSide="top"
            >
              <Upload size={24} />
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default FileUpload;