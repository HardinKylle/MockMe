'use client';

import { clsx } from 'clsx';
import { Button } from './ui/Button';
import { PlusIcon, PlayIcon, PauseIcon } from 'lucide-react';
import { AnimationScene } from '@/types/animation'; // <--- 1. Import type


interface TimelinePanelProps {
  isVisible: boolean;
  scenes: AnimationScene[]; // <--- 2. Add scenes prop
  onAddScene: () => void; // <--- 2. Add handler prop
  isPlaying: boolean; // <--- Add this
  onTogglePlay: () => void; // <--- Add this
  currentTime: number;
}

export default function TimelinePanel({
  isVisible,
  scenes,
  onAddScene,
  isPlaying, // <--- Destructure
  onTogglePlay,
  currentTime // <--- Destructure
}: TimelinePanelProps) {

  const totalDuration = scenes.reduce((acc, scene) => acc + scene.duration, 0);
  // Calculate playhead position as a percentage
  const playheadPercent =
    totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  // --- 2. Find the active scene ---
  let timeSoFar = 0;
  const activeScene = scenes.find((scene) => {
    const sceneEndTime = timeSoFar + scene.duration;
    const isActive = currentTime >= timeSoFar && currentTime < sceneEndTime;
    timeSoFar = sceneEndTime;
    return isActive;
  });
  return (
    <div
      className={clsx(
        'fixed bottom-3 left-1/2 z-20',
        'w-[480px] max-w-[90vw]',
        'p-2.5 rounded-xl border shadow-lg',
        'bg-linear-to-br from-[#0b1733]/90 to-[#0e1d3f]/90',
        'border-[#1b2b4a]/60 backdrop-blur-md',
        'flex flex-col gap-2',
        'transition-all duration-300 ease-in-out',
        {
          'opacity-100 -translate-x-1/2 translate-y-0': isVisible,
          'opacity-0 -translate-x-1/2 translate-y-10 pointer-events-none':
            !isVisible,
        }
      )}
    >
      {/* --- Track: Animation Layer --- */}
      <div className="h-10 w-full bg-[#0f2547]/70 rounded-lg border border-[#1e3a65]/40 p-1.5 flex items-center gap-2 overflow-x-auto relative">
        {/* --- 3. Playhead Element --- */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
          style={{
            left: `${playheadPercent}%`,
          }}
        />

        {/* --- Play/Pause Button --- */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 rounded-full bg-blue-900/40 border border-blue-700/30 hover:bg-blue-700/60 hover:border-blue-500/50 transition-all shrink-0 z-20" // <-- Add z-20
          onClick={onTogglePlay}
        >
          {isPlaying ? (
            <PauseIcon className="h-3.5 w-3.5 text-blue-200" />
          ) : (
            <PlayIcon className="h-3.5 w-3.5 text-blue-200" />
          )}
        </Button>

        {/* Dynamic Scenes */}
        {scenes.map((scene) => (
          <div
            key={scene.id}
            className={clsx(
              'h-6 bg-linear-to-r from-blue-500 to-indigo-200 rounded-md shrink-0 flex items-center justify-center px-2 shadow shadow-blue-900/30 hover:shadow-blue-600/30 transition cursor-pointer z-20', // <-- Add z-20
              {
                'ring-2 ring-blue-300 ring-offset-2 ring-offset-gray-900': // --- 4. Active Style ---
                  activeScene?.id === scene.id,
              }
            )}
          >
            <span className="text-[10px] font-medium text-white">
              {scene.name}
            </span>
          </div>
        ))}

        {/* Add Scene Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 rounded-full bg-blue-900/40 border border-blue-700/30 hover:bg-blue-700/60 hover:border-blue-500/50 transition-all shrink-0 z-20" // <-- Add z-20
          onClick={onAddScene}
        >
          <PlusIcon className="h-3.5 w-3.5 text-blue-200" />
        </Button>
      </div>

      {/* --- Track: Image Layer (Unchanged) --- */}
      <div className="h-8 w-full bg-[#0f2547]/70 rounded-lg border border-[#1e3a65]/40 p-1.5 flex items-center gap-2 overflow-x-auto relative">
        {/* --- 3. Playhead Element (on Image Track) --- */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
          style={{
            left: `${playheadPercent}%`,
          }}
        />

        <span className="text-[10px] text-blue-300 font-medium shrink-0 z-20">
          Image
        </span>

        <div className="h-1.5 w-48 bg-linear-to-r from-pink-500 to-rose-600 rounded-full shadow shadow-pink-900/30 z-20" />
      </div>
    </div>
  );
}