'use client';
import { AnimationScene } from '@/types/animation';
import { useDrag } from '@use-gesture/react';
import { useRef, useState, useEffect, RefObject } from 'react';
// Helper function to reorder the array
function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}
interface UseAnimationDragProps {
  scenes: AnimationScene[];
  onReorderScenes: (scenes: AnimationScene[]) => void;
  getClipLeftPercent: (index: number, scenes: AnimationScene[]) => number;
  getClipWidthPercent: (duration: number) => number;
  trackAreaRef: RefObject<HTMLDivElement | null>;
}
export function useAnimationDrag({
  scenes,
  onReorderScenes,
  getClipLeftPercent,
  getClipWidthPercent,
  trackAreaRef,
}: UseAnimationDragProps) {
 
  const [visualScenes, setVisualScenes] = useState(scenes);
  const [isDragging, setIsDragging] = useState(false);
  const draggedItemIndex = useRef<number | null>(null);
  useEffect(() => {
    if (!isDragging) {
      setVisualScenes(scenes);
    }
  }, [scenes, isDragging]);
  const bindAnimationDrag = useDrag(
    ({ args: [originalIndex], first, down, movement: [mx], memo }) => {
      if (!trackAreaRef.current) return;
      if (first) {
        setIsDragging(true);
        draggedItemIndex.current = originalIndex;
        return { originalIndex };
      }
      const trackWidthPx = trackAreaRef.current.clientWidth;
      const clipLeftPx = (getClipLeftPercent(originalIndex, scenes) / 100) * trackWidthPx;
      const clipWidthPx = (getClipWidthPercent(scenes[originalIndex].duration) / 100) * trackWidthPx;
      const draggedItemCenterPx = clipLeftPx + clipWidthPx / 2 + mx;
      let targetIndex = originalIndex;
      for (let i = 0; i < visualScenes.length; i++) {
        const scene = visualScenes[i];
        const leftPx = (getClipLeftPercent(i, visualScenes) / 100) * trackWidthPx;
        const widthPx = (getClipWidthPercent(scene.duration) / 100) * trackWidthPx;
        if (draggedItemCenterPx > leftPx && draggedItemCenterPx < leftPx + widthPx) {
          targetIndex = i;
          break;
        }
      }
      if (targetIndex !== originalIndex) {
        setVisualScenes((prev) => reorder(prev, originalIndex, targetIndex));
        originalIndex = targetIndex;
      }
     
      if (!down) {
        setIsDragging(false);
        draggedItemIndex.current = null;
        onReorderScenes(visualScenes);
      }
      return { originalIndex };
    },
    {
      axis: 'x',    }
  );
  return {
    visualScenes,
    isDragging,
    draggedItemIndex,
    bindAnimationDrag,
  };
}