'use client';

import { clsx } from 'clsx';
import { Button } from './ui/Button';
import { Plus, Play, Pause } from 'lucide-react';
import { AnimationScene } from '@/types/animation';
import { useDrag } from '@use-gesture/react';
import { useRef, useState, useEffect } from 'react';
import { useContentDrag } from '@/hooks/useContentDrag';
import ContentTrack from './ContentTrack';

interface TimelinePanelProps {
  isVisible: boolean;
  scenes: AnimationScene[];
  onAddScene: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number;
  selectedSceneId: string | null;
  onSelectScene: (id: string) => void;
  totalVideoDuration: number;
  setTotalVideoDuration: (duration: number) => void;
}

export default function TimelinePanel({
  isVisible,
  scenes,
  onAddScene,
  isPlaying,
  onTogglePlay,
  currentTime,
  selectedSceneId,
  onSelectScene,
  totalVideoDuration,
  setTotalVideoDuration,
}: TimelinePanelProps) {


  // Ref for the *scrolling container* that wraps both tracks
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Ref for the *stretching wrapper* (the p-2.5 div)
  const stretchWrapperRef = useRef<HTMLDivElement>(null);

  // Call the hook to get all the computed values and the drag handler
  const { draftDuration, isDragging, draftPixelWidth, bindDrag } =
    useContentDrag({
      totalVideoDuration,
      setTotalVideoDuration,
      scrollContainerRef,
      stretchWrapperRef,
    });

  const playheadPercent =
    totalVideoDuration > 0 ? (currentTime / totalVideoDuration) * 100 : 0;

  const getClipWidthPercent = (duration: number) => {
    return (duration / totalVideoDuration) * 100;
  };

  const getClipLeftPercent = (sceneIndex: number) => {
    const previousDuration = scenes.slice(0, sceneIndex).reduce((acc, s) => acc + s.duration, 0);
    return (previousDuration / totalVideoDuration) * 100;
  };

  // Format time to one decimal place (e.g., "0.0s")
  const formatTime = (time: number) => time.toFixed(1);


  return (
    <div
      className={`fixed bottom-4 left-1/2 z-20 w-[480px] max-w-[90vw] rounded-lg border shadow-xl bg-linear-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 backdrop-blur-xl transition-all duration-300 ease-out ${isVisible
        ? 'opacity-100 -translate-x-1/2 translate-y-0'
        : 'opacity-0 -translate-x-1/2 translate-y-10 pointer-events-none'
        }`}
    >
      {/* Header with time display and controls */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 rounded bg-blue-600 hover:bg-blue-500 transition-colors"
            onClick={onTogglePlay}
          >
            {isPlaying ? (
              <Pause className="h-3 w-3 text-white" />
            ) : (
              <Play className="h-3 w-3 text-white ml-0.5" />
            )}
          </Button>
          <span className="text-[10px] font-mono text-slate-300">
            {formatTime(currentTime)}s / {formatTime(draftDuration)}s
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 rounded bg-slate-700/50 hover:bg-slate-600/50 transition-colors flex items-center gap-1.5"
          onClick={onAddScene}
        >
          <div className="flex items-center space-x-2">
            <Plus className="h-4 w-4 text-slate-300" />
          </div>
        </Button>
      </div>

      {/* This new div wraps the tracks and handles scrolling */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto"
        style={{
          // Hide scrollbar aesthetics
          scrollbarWidth: 'none',
        }}
      >
        {/* This div stretches, pushing the scrollbar */}
        <div
          ref={stretchWrapperRef} // Added ref here
          className="p-2.5 space-y-2"
          style={{
            width: draftPixelWidth, // Set pixel width during drag
            transition: isDragging ? 'none' : 'width 0.3s ease-out', // Snap back
          }}
        >
          {/* --- ANIMATION TRACK --- */}
          <div className="flex items-stretch gap-2">
            {/* Track label */}
            <div className="w-16 shrink-0 flex items-center">
              <span className="text-[10px] font-medium text-slate-400">
                Animation
              </span>
            </div>

            {/* ---TRACK AREA  --- */}
            {/* This flex-1 div will grow with its parent */}
            <div className="flex-1 relative">
              {/* Timeline ruler background */}
              <div className="absolute inset-0 bg-slate-800/50 rounded border border-slate-700/50" />

              {/* Clips container */}
              <div className="relative h-8 rounded">
                {/* Scene clips */}
                {scenes.map((scene, index) => (
                  <div
                    key={scene.id}
                    onClick={() => onSelectScene(scene.id)}
                    className={`absolute top-1 bottom-1 rounded cursor-pointer bg-linear-to-r from-blue-500 to-blue-600 border border-blue-400/30 hover:border-blue-300/60 flex items-center justify-center px-2 shadow hover:shadow-lg ${selectedSceneId === scene.id
                      ? 'ring-1 ring-blue-400 ring-offset-1 ring-offset-slate-900 z-10'
                      : ''
                      } ${isDragging ? 'transition-none' : 'transition-all'
                      }`} // Prevent transitions during drag
                    style={{
                      left: `${getClipLeftPercent(index)}%`,
                      width: `${getClipWidthPercent(scene.duration)}%`,
                    }}
                  >
                    <span className="text-[10px] font-medium text-white truncate">
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

          <ContentTrack
            playheadPercent={playheadPercent}
            dragHandleProps={bindDrag()} 
          />
        </div>
      </div>
    </div>
  );
}