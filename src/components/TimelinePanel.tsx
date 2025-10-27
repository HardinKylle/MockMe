'use client';

import { Button } from './ui/Button';
import { Plus, Play, Pause } from 'lucide-react';
import { AnimationScene } from '@/types/animation';
import { useRef, useState, useEffect, useCallback } from 'react'; // Remove useState
import ContentTrack from './ContentTrack';
import AnimationTrack from './AnimationTrack';

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
  uploadedFileType: 'image' | 'video' | null;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  // --- ADD THESE PROPS ---
  isScrubbing: boolean;
  setIsScrubbing: (isScrubbing: boolean) => void;
  // -----------------------
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
  uploadedFileType,
  setCurrentTime,
  setIsPlaying,
  // --- GET NEW PROPS ---
  isScrubbing,
  setIsScrubbing,
}: TimelinePanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // --- REMOVE LOCAL STATE ---
  // const [isScrubbing, setIsScrubbing] = useState(false);
  // --------------------------
  const trackContainerRef = useRef<HTMLDivElement>(null);

  const playheadPercent =
    totalVideoDuration > 0 ? (currentTime / totalVideoDuration) * 100 : 0;

  const getClipWidthPercent = (duration: number) => {
    return (duration / totalVideoDuration) * 100;
  };

  const getClipLeftPercent = (
    sceneIndex: number,
    sceneArray: AnimationScene[]
  ) => {
    const previousDuration = sceneArray
      .slice(0, sceneIndex)
      .reduce((acc, s) => acc + s.duration, 0);
    return (previousDuration / totalVideoDuration) * 100;
  };

  const formatTime = (time: number) => time.toFixed(1);

  // --- DRAG HANDLERS (use props) ---
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      // Use isScrubbing prop
      if (!isScrubbing || !trackContainerRef.current || totalVideoDuration === 0)
        return;

      const rect = trackContainerRef.current.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const trackWidth = rect.width;

      let progress = mouseX / trackWidth;
      progress = Math.max(0, Math.min(1, progress));

      const newTime = progress * totalVideoDuration;
      setCurrentTime(newTime);
    },
    [isScrubbing, totalVideoDuration, setCurrentTime] // Use isScrubbing prop
  );

  const handleMouseUp = useCallback(() => {
    setIsScrubbing(false); // Use setIsScrubbing prop
  }, [setIsScrubbing]); // Add prop dependency

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsPlaying(false);
    setIsScrubbing(true); // Use setIsScrubbing prop
  };

  useEffect(() => {
    if (isScrubbing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, handleMouseMove, handleMouseUp]); // Use isScrubbing prop
  // ---------------------------

  return (
    <div
      className={`fixed bottom-40 lg:bottom-4 left-1/2 z-20 w-[480px] max-w-[90vw] rounded-lg border shadow-xl bg-linear-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 backdrop-blur-xl transition-all duration-300 ease-out ${isVisible
        ? 'opacity-100 -translate-x-1/2 translate-y-0'
        : 'opacity-0 -translate-x-1/2 translate-y-10 pointer-events-none'
        }`}
    >
      {/* Header */}
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
            {formatTime(currentTime)}s / {formatTime(totalVideoDuration)}s
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 rounded bg-slate-700/50 hover:bg-slate-600/50 transition-colors flex items-center gap-1.5"
          onClick={onAddScene}
        >
          <div className="flex items-center space-x-4">
            <Plus className="h-4 w-4 text-slate-300" />
          </div>
        </Button>
      </div>

      {/* Track Container */}
      <div ref={scrollContainerRef} className="overflow-x-auto">
        <div className="p-2.5 pt-7">
          <div className="flex gap-2">
            {/* 1. The Label Column */}
            <div className="w-16 shrink-0 space-y-2">
              <div className="h-8 flex items-center">
                <span className="text-[10px] font-medium text-slate-400">
                  Animation
                </span>
              </div>
              <div className="h-8 flex items-center"> {/* Changed to h-8 */}
                <span className="text-[10px] font-medium text-slate-400">
                  Content
                </span>
              </div>
            </div>

            {/* 2. The Track Column */}
           <div
              ref={trackContainerRef}
              className="flex-1 relative space-y-2"
            >
              <div
                className="absolute -top-3 -bottom-1 w-0.5 bg-red-500 z-30 pointer-events-none"
                style={{ left: `${playheadPercent}%` }}
              >
                <div 
                  className="playhead-draggable absolute -top-2 -left-2 w-4 h-4 rounded-full bg-red-500 border-2 border-white pointer-events-auto" 
                  onMouseDown={handleMouseDown}
                />
              </div>

              <AnimationTrack
                scenes={scenes}
                selectedSceneId={selectedSceneId}
                onSelectScene={onSelectScene}
                getClipLeftPercent={getClipLeftPercent}
                getClipWidthPercent={getClipWidthPercent}
                playheadPercent={playheadPercent}
              />
              <ContentTrack
                playheadPercent={playheadPercent}
                uploadedFileType={uploadedFileType}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}