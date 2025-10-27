import * as React from 'react'; // <-- CORRECTED IMPORT
import { cn } from '@/lib/utils';

interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, id, ...props }, ref) => {
    // Always call useId() at the top level
    const generatedId = React.useId();
    // Decide which ID to use *after* the hook call
    const finalId = id || `toggle-${generatedId}`;

    return (
      <div className={cn('flex items-center justify-between', className)}>
        {label && (
          <label
            htmlFor={finalId} // Use finalId
            className="text-xs font-medium text-slate-200 cursor-pointer"
          >
            {label}
          </label>
        )}
        <label
          htmlFor={finalId} // Use finalId
          className="relative inline-flex items-center h-5 w-9 cursor-pointer shrink-0"
        >
          <input
            type="checkbox"
            id={finalId} // Use finalId
            ref={ref}
            className="peer sr-only"
            {...props}
          />
          <span
            className="absolute inset-0 rounded-full bg-slate-700 transition-colors peer-checked:bg-blue-500"
            aria-hidden="true"
          />
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