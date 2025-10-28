'use client';

import { Button } from './ui/Button';
import { Plus, Play, Pause, Download, Loader } from 'lucide-react';
import { AnimationScene } from '@/types/animation';
import { useRef, useState, useEffect, useCallback } from 'react';
import ContentTrack from './ContentTrack';
import AnimationTrack from './AnimationTrack';

interface TimelinePanelProps {
  isVisible: boolean;
  scenes: AnimationScene[];
  onAddScene: () => void;
  onExport: () => void;
  isRecording: boolean;
  showExportConfirm: boolean;
  onConfirmExport: () => void;
  onCancelExport: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number;
  selectedSceneId: string | null;
  onSelectScene: (id: string) => void;
  totalVideoDuration: number;
  uploadedFileType: 'image' | 'video' | null;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  isScrubbing: boolean;
  setIsScrubbing: (isScrubbing: boolean) => void;
}

export default function TimelinePanel({
  isVisible,
  scenes,
  onAddScene,
  onExport,
  isRecording,
  showExportConfirm,
  onConfirmExport,
  onCancelExport,
  isPlaying,
  onTogglePlay,
  currentTime,
  selectedSceneId,
  onSelectScene,
  totalVideoDuration,
  uploadedFileType,
  setCurrentTime,
  setIsPlaying,
  isScrubbing,
  setIsScrubbing,
}: TimelinePanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
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
    [isScrubbing, totalVideoDuration, setCurrentTime]
  );

  const handleMouseUp = useCallback(() => {
    setIsScrubbing(false);
  }, [setIsScrubbing]);

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsPlaying(false);
    setIsScrubbing(true);
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
  }, [isScrubbing, handleMouseMove, handleMouseUp]);

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
            variant="secondary"
            size="xs"
            className="w-6 p-0"
            onClick={onTogglePlay}
            disabled={isRecording}
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

        {/* --- MODIFIED: Added 'relative' to position the pop-up --- */}
        <div className="relative flex items-center gap-2">
          {/* --- ADDED: The confirmation pop-up --- */}
        {showExportConfirm && (
            <div className="absolute bottom-full right-0 mb-2 w-64 rounded-lg border border-slate-700/50 bg-slate-800 p-3 shadow-xl z-30">
              {/* [Pop-up content remains the same] */}
              <div className="flex items-start gap-2.5">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    Confirm Export
                  </p>
                  <p className="text-xs text-slate-300 mt-1">
                    This will render and download a .webm video.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={onCancelExport}
                  className="px-2"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary" // Your blue button
                  size="xs"
                  onClick={onConfirmExport}
                  className="px-2"
                >
                  Export
                </Button>
              </div>
              {/* --- END Pop-up content --- */}

              {/* --- MODIFIED: Centered the triangle --- */}
              {/* Little triangle at the bottom */}
              <div className="absolute -bottom-[6px] right-2.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-800" />
            </div>
          )}

          <Button
            variant="secondary"
            size="xs"
            onClick={onAddScene}
            tooltip="Add Scene"
            disabled={isRecording || showExportConfirm} // Also disable
          >
            <Plus className="h-4 w-4 text-slate-300" />
          </Button>

          <Button
            variant="secondary"
            size="xs"
            // --- MODIFIED: onClick now opens the pop-up ---
            onClick={onExport}
            tooltip="Export Video"
            disabled={isRecording}
            className="w-8"
            // --- MODIFIED: Show as "active" when pop-up is open ---
            isActive={showExportConfirm}
          >
            {isRecording ? (
              <Loader className="h-4 w-4 text-slate-300 animate-spin" />
            ) : (
              <Download className="h-4 w-4 text-slate-300" />
            )}
          </Button>
        </div>
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
              <div className="h-8 flex items-center">
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
                {/* --- UI MODIFIED: Cleaned up playhead handle --- */}
                <div
                  className="playhead-draggable absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-md pointer-events-auto cursor-col-resize"
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