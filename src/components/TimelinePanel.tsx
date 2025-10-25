'use client';

import { clsx } from 'clsx';
import { Button } from './ui/Button';
import { Plus, Play, Pause } from 'lucide-react';
import { AnimationScene } from '@/types/animation';
import { useDrag } from '@use-gesture/react';
import { useRef, useState, useEffect } from 'react';
import { useContentDrag } from '@/hooks/useContentDrag';
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


  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const stretchWrapperRef = useRef<HTMLDivElement>(null);

  const {
    draftDuration,
    isDragging: isContentTrackDragging,
    draftPixelWidth,
    bindContentDrag, 
  } = useContentDrag({
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

  const getClipLeftPercent = (
    sceneIndex: number,
    sceneArray: AnimationScene[]
  ) => {
    const previousDuration = sceneArray
      .slice(0, sceneIndex)
      .reduce((acc, s) => acc + s.duration, 0);
    return (previousDuration / totalVideoDuration) * 100;
  };

  // Format time to one decimal place (e.g., "0.0s")
  const formatTime = (time: number) => time.toFixed(1);


return (
    <div
      className={`fixed bottom-4 left-1/2 z-20 w-[480px] max-w-[90vw] rounded-lg border shadow-xl bg-linear-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 backdrop-blur-xl transition-all duration-300 ease-out ${
        isVisible
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

      {/* Track Container */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        <div
          ref={stretchWrapperRef}
          className="p-2.5 space-y-2"
          style={{
            width: draftPixelWidth,
            transition: isContentTrackDragging ? 'none' : 'width 0.3s ease-out',
          }}
        >
          {/* --- ANIMATION TRACK --- */}
          <AnimationTrack
            scenes={scenes}
            selectedSceneId={selectedSceneId}
            onSelectScene={onSelectScene}
            isContentTrackDragging={isContentTrackDragging} 
            getClipLeftPercent={getClipLeftPercent}
            getClipWidthPercent={getClipWidthPercent}
            playheadPercent={playheadPercent}
          />

          {/* --- CONTENT TRACK --- */}
          <ContentTrack
            playheadPercent={playheadPercent}
            bindContentDrag={bindContentDrag()} 
          />
        </div>
      </div>
    </div>
  );
}