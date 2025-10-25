'use client';

import { useDrag } from '@use-gesture/react';
import { useRef, useState, useEffect, RefObject } from 'react';

interface UseContentDragProps {
  totalVideoDuration: number;
  setTotalVideoDuration: (duration: number) => void;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  stretchWrapperRef: RefObject<HTMLDivElement | null>;
}

export function useContentDrag({
  totalVideoDuration,
  setTotalVideoDuration,
  scrollContainerRef,
  stretchWrapperRef,
}: UseContentDragProps) {
  
  // Tracks the duration *during* the drag
  const [draftDuration, setDraftDuration] = useState(totalVideoDuration);
  // Tracks if we are currently dragging
  const [isDragging, setIsDragging] = useState(false);
  // Holds the pixel width of the track area during the drag
  const [draftPixelWidth, setDraftPixelWidth] = useState<string>('100%');

  // Ref to store all initial drag info
  const dragInfoRef = useRef({
    initialWidth: 0,
    initialDuration: 10,
    initialScrollLeft: 0,
    pixelsPerSecond: 40,
  });

  useEffect(() => {
    // Sync draft duration when prop changes (e.g., on load or after drag)
    if (!isDragging) {
      setDraftDuration(totalVideoDuration);
      setDraftPixelWidth('100%');
    }
  }, [totalVideoDuration, isDragging]);

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

  return {
    draftDuration,
    isDragging,
    draftPixelWidth,
    bindDrag,
  };
}