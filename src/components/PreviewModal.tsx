'use client';
import { useState } from 'react';
import { X, Download } from 'lucide-react';

interface PreviewModalProps {
  imageUrl: string;
  onClose: () => void;
}
export default function PreviewModal({ imageUrl, onClose }: PreviewModalProps) {
  // 2. Add state for the checkbox
  const [includeBackground, setIncludeBackground] = useState(true);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = 'mockme-capture.png';

    if (includeBackground) {
      // --- Logic to add a white background ---
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Set canvas to the same size as the image
        canvas.width = img.width;
        canvas.height = img.height;

        // Fill background with white
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw the captured image on top
        ctx?.drawImage(img, 0, 0);

        // Trigger download from the canvas
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      // Set the image source (this triggers the onload)
      img.src = imageUrl;

    } else {
      // --- Logic for transparent background ---
      // Just download the original transparent dataUrl
      link.href = imageUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg relative mx-4">
        {/* ... (Close Button and Header are the same) ... */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-white text-gray-600 p-2 rounded-full shadow-lg hover:bg-gray-100 hover:text-gray-900 transition-all"
          title="Close"
        >
          <X size={20} />
        </button>

        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Capture Preview
        </h3>
        
        {/* Image Preview (no change) */}
        <div className="mb-6 rounded-md overflow-hidden border border-gray-200">
          <img 
            src={imageUrl} 
            alt="Capture preview" 
            className="w-full h-auto object-contain"
          />
        </div>

        {/* 3. Add the Checkbox */}
        <div className="mb-4 flex items-center">
          <input
            id="include-bg"
            type="checkbox"
            checked={includeBackground}
            onChange={(e) => setIncludeBackground(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="include-bg" className="ml-2 block text-sm text-gray-900">
            Include Background
          </label>
        </div>

        {/* Action Buttons (no change) */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-white text-gray-700 font-semibold py-2 px-4 rounded-md shadow-sm border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download size={18} />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}