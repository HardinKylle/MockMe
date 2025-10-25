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
  
  const [draftDuration, setDraftDuration] = useState(totalVideoDuration);
  const [isDragging, setIsDragging] = useState(false);
  const [draftPixelWidth, setDraftPixelWidth] = useState<string>('100%');

  const dragInfoRef = useRef({
    initialWidth: 0,
    initialDuration: 10,
    initialScrollLeft: 0,
    pixelsPerSecond: 40,
  });

  useEffect(() => {
    if (!isDragging) {
      setDraftDuration(totalVideoDuration);
      setDraftPixelWidth('100%');
    }
  }, [totalVideoDuration, isDragging]);

  const bindContentDrag = useDrag( // <-- RENAMED
    ({ first, down, movement: [mx] }) => {
      if (first) {
        setIsDragging(true);
        const initialWidth = stretchWrapperRef.current?.clientWidth;
        if (!initialWidth) return;

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
        scrollContainerRef.current.scrollLeft = initialScrollLeft + mx;
      }

      if (!down) {
        setIsDragging(false);
        setTotalVideoDuration(newDuration);
        setDraftPixelWidth('100%'); 
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
    bindContentDrag, // <-- RENAMED
  };
}