'use client';

// Renders the timeline track with scene clips and playhead indicator.

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
    <div className="relative">
      {/* Base track background */}
      <div className="absolute inset-0 bg-slate-800/80 rounded border border-slate-700/80" />

      {/* Container for clips */}
      <div className="relative h-8 rounded">
        {scenes.map((scene, index) => (
          <div
            key={scene.id}
            onClick={() => onSelectScene(scene.id)}
            className={`absolute top-1 bottom-1 rounded cursor-pointer flex items-center justify-center px-2 shadow-inner transition-all duration-150 ease-out
              ${
                selectedSceneId === scene.id
                  ? 'bg-blue-600 border border-blue-400/80 ring-1 ring-yellow-400 z-20' // Selected state
                  : 'bg-linear-to-r from-slate-600 to-slate-500 border border-slate-400/50 hover:border-slate-300/60 z-10' // Default state
              } 
            `}
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
        {/* Playhead indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-30 pointer-events-none"
          style={{ left: `${playheadPercent}%` }}
        />
      </div>
    </div>
  );
}