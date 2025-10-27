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
    <div className="relative">
      <div className="absolute inset-0 bg-slate-800/80 rounded border border-slate-700" />

      {/* Container no longer needs padding */}
      <div className="relative h-8 rounded">
        {scenes.map((scene, index) => (
          <div
            key={scene.id}
            onClick={() => onSelectScene(scene.id)}
            className={`absolute top-1 bottom-1 rounded cursor-pointer bg-linear-to-r from-blue-500 to-blue-600 border border-blue-400/50 hover:border-blue-300/60 flex items-center justify-center px-2  hover:shadow-lg shadow-inner ${
              selectedSceneId === scene.id
                ? 'ring-1 ring-yellow-400 z-10'
                : ''
            } 
              z-10`}
            style={{
              // --- STYLE MODIFIED ---
              // Removed the 'calc()' functions for precise spacing
              left: `${getClipLeftPercent(index, scenes)}%`,
              width: `${getClipWidthPercent(scene.duration)}%`,
            }}
          >
            <span className="text-[10px] font-medium text-white truncate pointer-events-none">
              {scene.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}