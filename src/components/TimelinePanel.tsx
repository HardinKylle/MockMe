'use client';

import { clsx } from 'clsx';
import { Button } from './ui/Button';
import { Plus, Play, Pause } from 'lucide-react';
import { AnimationScene } from '@/types/animation';
import { useDrag } from '@use-gesture/react';
import { useRef, useState, useEffect } from 'react';

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

  // Tracks the duration *during* the drag
  const [draftDuration, setDraftDuration] = useState(totalVideoDuration);
  // Tracks if we are currently dragging
  const [isDragging, setIsDragging] = useState(false);
  // Holds the pixel width of the track area during the drag
  const [draftPixelWidth, setDraftPixelWidth] = useState<string>('100%');

  useEffect(() => {
    // Sync draft duration when prop changes (e.g., on load or after drag)
    if (!isDragging) {
      setDraftDuration(totalVideoDuration);
      setDraftPixelWidth('100%'); 
    }
  }, [totalVideoDuration, isDragging]);

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

  // Ref for the *scrolling container* that wraps both tracks
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Ref for the *stretching wrapper* (the p-2.5 div) to measure its initial width
  const stretchWrapperRef = useRef<HTMLDivElement>(null);
  // Ref to store all initial drag info
  const dragInfoRef = useRef({
    initialWidth: 0,
    initialDuration: 10,
    initialScrollLeft: 0,
    pixelsPerSecond: 40,
  });

  const bindDrag = useDrag(
    ({ first, down, movement: [mx] }) => {
      if (first) {
        setIsDragging(true);
        // On drag start, get the track wrapper's *actual pixel width*
        const initialWidth = stretchWrapperRef.current?.clientWidth;
        if (!initialWidth) return;

        // Store all initial drag info
        dragInfoRef.current = {
          initialWidth: initialWidth,
          initialDuration: totalVideoDuration,
          initialScrollLeft: scrollContainerRef.current?.scrollLeft || 0,
          pixelsPerSecond: initialWidth / totalVideoDuration,
        };
      }

      const {
        initialWidth,
        initialDuration,
        initialScrollLeft,
        pixelsPerSecond,
      } = dragInfoRef.current;

      let newPixelWidth = initialWidth + mx;

      let newDuration = newPixelWidth / pixelsPerSecond;
      newDuration = Math.max(3, Math.min(newDuration, 60)); 

      newPixelWidth = newDuration * pixelsPerSecond;

      setDraftPixelWidth(`${newPixelWidth}px`);
      setDraftDuration(newDuration);

      if (scrollContainerRef.current) {
        // We want to scroll by the *unconstrained* mouse movement
        scrollContainerRef.current.scrollLeft = initialScrollLeft + mx;
      }

      if (!down) {
        setIsDragging(false);
        setTotalVideoDuration(newDuration);
        setDraftPixelWidth('100%'); // Snap back to 100%
        // Reset scroll
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = 0;
        }
      }
    },
    {
      axis: 'x',
    }
  );

  const draftContentWidthPercent =
    (draftDuration / totalVideoDuration) * 100;

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

          {/* --- CONTENT TRACK --- */}
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
                  {...bindDrag()}
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-4 bg-white rounded-sm cursor-col-resize z-30"
                  style={{
                    right: '0px', // Snap to the end
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
        </div>
      </div>
    </div>
  );
}