'use client';

interface ContentTrackProps {
  playheadPercent: number;
  bindContentDrag: { [key: string]: any }; 
}

export default function ContentTrack({
  playheadPercent,
  bindContentDrag,
}: ContentTrackProps) {
  return (
    <div className="flex items-stretch gap-2">
      {/* Track label */}
      <div className="w-16 shrink-0 flex items-center">
        <span className="text-[10px] font-medium text-slate-400">
          Content
        </span>
      </div>

      {/* Track content area */}
      <div className="flex-1 relative">
        {/* Timeline ruler background */}
        <div className="absolute inset-0 bg-slate-800/50 rounded border border-slate-700/50" />

        {/* Clips container */}
        <div className="relative h-6 rounded">
          {/* Content clip (stretches with parent) */}
          <div className="absolute top-1 bottom-1 left-0.5 right-0.5 rounded bg-linear-to-r from-pink-500 to-rose-500 border border-pink-400/30" />

          {/* --- DRAG HANDLE --- */}
          <div
            {...bindContentDrag} 
            className="absolute top-1/2 -translate-y-1/2 w-2 h-4 bg-white rounded-sm cursor-col-resize z-30"
            style={{
              right: '0px',
              touchAction: 'none',
            }}
          />

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
            style={{ left: `${playheadPercent}%` }}
          >
            <div className="absolute -top-0.5 -left-1 w-2 h-2 bg-red-500 rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}