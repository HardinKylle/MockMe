import * as React from 'react';
import { cn } from '@/lib/utils'; //

interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; // Optional label for accessibility/display
}

const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, id, ...props }, ref) => {
    const generatedId = id || `toggle-${React.useId()}`;

    return (
      // Main container, aligns the text label and the switch
      // Uses justify-between to push them to opposite ends
      <div className={cn('flex items-center justify-between', className)}>
        {/* Text Label */}
        {label && (
          <label
            htmlFor={generatedId}
            className="text-xs font-medium text-slate-200 cursor-pointer"
          >
            {label}
          </label>
        )}

        {/* Container for the switch itself, which is also a label */}
        <label
          htmlFor={generatedId}
          className="relative inline-flex items-center h-5 w-9 cursor-pointer flex-shrink-0"
        >
          <input
            type="checkbox"
            id={generatedId}
            ref={ref}
            className="peer sr-only" // The hidden input is the peer
            {...props}
          />
          {/* The Track: Sibling of input */}
          <span
            className="absolute inset-0 rounded-full bg-slate-700 transition-colors peer-checked:bg-blue-500"
            aria-hidden="true"
          />
          {/* The Thumb: Sibling of input */}
          <span
            className="absolute left-0.5 top-0.5 inline-block h-4 w-4 transform rounded-full bg-slate-400 shadow ring-0 transition-transform duration-200 ease-in-out peer-checked:translate-x-4"
            aria-hidden="true"
          />
        </label>
      </div>
    );
  }
);
Toggle.displayName = 'Toggle';

export { Toggle };