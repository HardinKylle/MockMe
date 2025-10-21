import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
    OnImageUpload: (file: File | null) => void;
}

/**
 * ImageUpload
 * Compact floating upload control used over the 3D canvas.
 * - Keeps a small preview (data URL) for UI only.
 * - Calls OnImageUpload with the original File (or null) for texture handling.
 */
const ImageUpload: React.FC<ImageUploadProps> = ({ OnImageUpload }) => {
    // Local preview stored as a data URL (for small thumbnail display)
    const [preview, setPreview] = useState<string | null>(null);
    // Drag state to allow visual feedback if you want to expand UI later
    const [isDragging, setIsDragging] = useState<boolean>(false);
    // Hidden file input ref used to open the native picker
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    /**
     * Process a selected file or clear.
     * - If valid image: create a data URL for preview and forward the File.
     * - If null: clear preview and forward null.
     */
    const handleFileChange = (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageUrl = reader.result as string | null;
                setPreview(imageUrl); 
                OnImageUpload(file); // forward original File for three.js texture creation
            };
            reader.readAsDataURL(file);
        } else if (file === null) {
            // Clear preview and notify parent
            setPreview(null);
            OnImageUpload(null);
        } else {
            // Non-image file chosen
            alert('Please upload a valid image file.');
        }
    };

    // Called when native file input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file) handleFileChange(file);
    };

    // Drag & drop handlers (prevent defaults and read first file)
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0] ?? null;
        if (file) handleFileChange(file);
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    // Remove uploaded image: clear preview, notify parent, reset input value
    const handleRemove = () => {
        setPreview(null);
        OnImageUpload(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Open native file picker
    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <>
            {/* Hidden native file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
            />

            {/* Floating control — positioned bottom-right over the canvas */}
            <div className="absolute bottom-8 right-8 z-10">
                {preview ? (
                    // When an image is uploaded show a remove button (with tooltip)
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

                        {/* Tooltip shown on hover */}
                        <div className="
              absolute bottom-full right-0 mb-3
              bg-gray-800 text-white text-xs px-3 py-1.5 rounded-md shadow-lg
              opacity-0 invisible group-hover:opacity-100 group-hover:visible
              transition-all duration-200 ease-in-out
              transform translate-y-2 group-hover:translate-y-0
              whitespace-nowrap
            ">
                            Remove image
                            <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-800"></div>
                        </div>
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

                        {/* Tooltip shown on hover */}
                        <div className="
              absolute bottom-full right-0 mb-3
              bg-gray-800 text-white text-xs px-3 py-1.5 rounded-md shadow-lg
              opacity-0 invisible group-hover:opacity-100 group-hover:visible
              transition-all duration-200 ease-in-out
              transform translate-y-2 group-hover:translate-y-0
              whitespace-nowrap
            ">
                            Supports: JPG, PNG, WEBP
                            <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-800"></div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ImageUpload;