'use client';

import { AnimationScene } from '@/types/animation';

interface AnimationTrackProps {
  scenes: AnimationScene[];
  selectedSceneId: string | null;
  onSelectScene: (id: string) => void;
  getClipLeftPercent: (index: number, scenes: AnimationScene[]) => number;
  getClipWidthPercent: (duration: number) => number;
  playheadPercent: number;
}

export default function AnimationTrack({
  scenes,
  selectedSceneId,
  onSelectScene,
  getClipLeftPercent,
  getClipWidthPercent,
  playheadPercent,
}: AnimationTrackProps) {


  return (
    <div className="flex items-stretch gap-2">
      {/* Track label */}
      <div className="w-16 shrink-0 flex items-center">
        <span className="text-[10px] font-medium text-slate-400">
          Animation
        </span>
      </div>

      {/* ---TRACK AREA --- */}
      <div /* ref={trackAreaRef} */ className="flex-1 relative"> 
        {/* Timeline ruler background */}
        <div className="absolute inset-0 bg-slate-800/50 rounded border border-slate-700/50" />

        {/* Clips container */}
        <div className="relative h-8 rounded">
          {/* Scene clips */}
          {scenes.map((scene, index) => ( 
            <div
              key={scene.id}
              onClick={() => onSelectScene(scene.id)} 
              className={`absolute top-1 bottom-1 rounded cursor-pointer bg-linear-to-r from-blue-500 to-blue-600 border border-blue-400/30 hover:border-blue-300/60 flex items-center justify-center px-2 shadow hover:shadow-lg ${
                selectedSceneId === scene.id
                  ? 'ring-1 ring-blue-400 ring-offset-1 ring-offset-slate-900 z-10'
                  : ''
              } 
              z-10`}
              style={{
                left: `${getClipLeftPercent(index, scenes)}%`, 
                width: `${getClipWidthPercent(scene.duration)}%`,
              }}
            >
              <span className="text-[10px] font-medium text-white truncate pointer-events-none">
                {scene.name}
              </span>
            </div>
          ))}

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