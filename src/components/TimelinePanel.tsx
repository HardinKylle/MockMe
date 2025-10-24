'use client';

import { clsx } from 'clsx';
import { Button } from './ui/Button';
import { PlusIcon } from 'lucide-react';

interface TimelinePanelProps {
  isVisible: boolean;
}

export default function TimelinePanel({ isVisible }: TimelinePanelProps) {
  return (
    <div
      className={clsx(
        'fixed bottom-3 left-1/2 z-20',
        'w-[480px] max-w-[90vw]', 
        'p-2.5 rounded-xl border shadow-lg',
        // 🎨 Navy Blue Glass Theme (compact)
        'bg-gradient-to-br from-[#0b1733]/90 to-[#0e1d3f]/90',
        'border-[#1b2b4a]/60 backdrop-blur-md',
        'flex flex-col gap-2',
        'transition-all duration-300 ease-in-out',
        {
          'opacity-100 -translate-x-1/2 translate-y-0': isVisible,
          'opacity-0 -translate-x-1/2 translate-y-10 pointer-events-none': !isVisible,
        }
      )}
    >
      {/* --- Track: Animation Layer --- */}
      <div className="h-10 w-full bg-[#0f2547]/70 rounded-lg border border-[#1e3a65]/40 p-1.5 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] text-blue-300 font-medium flex-shrink-0 w-16">
          Animation
        </span>

        <div className="h-6 bg-gradient-to-r from-blue-500 to-indigo-200 rounded-md flex-shrink-0 flex items-center justify-center px-2 shadow shadow-blue-900/30 hover:shadow-blue-600/30 transition">
          <span className="text-[10px] font-medium text-white">Default Spin</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 rounded-full bg-blue-900/40 border border-blue-700/30 hover:bg-blue-700/60 hover:border-blue-500/50 transition-all flex-shrink-0"
        >
          <PlusIcon className="h-3.5 w-3.5 text-blue-200" />
        </Button>
      </div>

      {/* --- Track: Image Layer --- */}
      <div className="h-8 w-full bg-[#0f2547]/70 rounded-lg border border-[#1e3a65]/40 p-1.5 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] text-blue-300 font-medium flex-shrink-0 w-16">
          Image
        </span>

        <div className="h-1.5 w-48 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full shadow shadow-pink-900/30" />
      </div>
    </div>
  );
}
