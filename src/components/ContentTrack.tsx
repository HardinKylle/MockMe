'use client';

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
      {/* Updated Track Background */}
      <div className="absolute inset-0 bg-slate-800/80 rounded border border-slate-700" />

      {/* Container changed from h-6 to h-8 */}
      <div className="relative h-8 rounded">
        {/* Clip has shadow-inner and consistent border */}
        <div className="absolute top-1 bottom-1 left-0.5 right-0.5 rounded bg-linear-to-r from-pink-500 to-rose-500 border border-pink-400/50 shadow-inner">
          {uploadedFileType === 'video' && (
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-[10px] font-medium pointer-events-none z-10">
              Uploaded Video
            </span>
          )}
        </div>
      </div>
    </div>
  );
}