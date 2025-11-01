'use client';

// Renders the timeline track for the uploaded content (image or video).
interface ContentTrackProps {
  playheadPercent: number;
  uploadedFileType: 'image' | 'video' | null;
}

export default function ContentTrack({
  playheadPercent,
  uploadedFileType,
}: ContentTrackProps) {
  return (
    <div className="relative">
      {/* Base track background */}
      <div className="absolute inset-0 bg-slate-800/80 rounded border border-slate-700/80" />

      {/* Container */}
      <div className="relative h-8 rounded">
        {/* Clip (Using new Teal gradient) */}
        <div
          className="absolute top-1 bottom-1 left-0 right-0 rounded bg-linear-to-r from-teal-700 to-cyan-700 border border-teal-500/60 shadow-inner"
          style={{
            // This ensures the clip doesn't have tiny gaps
            left: '0.125rem', 
            right: '0.125rem',
          }}
        >
          {uploadedFileType === 'video' && (
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-[10px] font-medium pointer-events-none z-10">
              Uploaded Video
            </span>
          )}
          {uploadedFileType === 'image' && (
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-[10px] font-medium pointer-events-none z-10">
              Uploaded Image
            </span>
          )}
        </div>
        {/* Playhead indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-30 pointer-events-none"
          style={{ left: `${playheadPercent}%` }}
        />
      </div>
    </div>
  );
}