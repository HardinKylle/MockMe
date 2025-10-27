import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Define all button styles using cva
const buttonVariants = cva(
  // Base styles applied to all variants
  'relative group inline-flex items-center justify-center font-medium transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed',
  {
    variants: {
      // Different button types
      variant: {
        // --- *** MODIFIED: New Darker Glassy Blue Style *** ---
        primary:
          'bg-blue-900/80 text-white hover:bg-blue-700/70 border border-blue-700/60 shadow-sm rounded-full',
        // --- *** END MODIFICATION *** ---
        secondary:
          'bg-slate-700/50 text-slate-100 hover:bg-slate-600/50 border border-slate-600/50 shadow-sm',
        ghost: 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-100',
        danger:
          'text-red-500 hover:bg-red-500/10 hover:text-red-400 disabled:text-red-500/50 disabled:hover:bg-transparent rounded-full',
        'menu-item':
          'w-full justify-start text-left px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700/50 rounded-md',
      },
      // Different button sizes
      size: {
        default: 'p-4 rounded-full',
        md: 'h-8 px-3 text-xs rounded-md',
        sm: 'h-7 w-7 rounded-md',
        xs: 'h-6 px-2 text-xs rounded-md',
        full: 'h-12 flex-1',
        'menu-item': 'h-auto',
      },
    },
    // Default styles if none are provided
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

// Define the component's props
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  tooltip?: string;
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right';
  isActive?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      tooltip,
      tooltipSide = 'top',
      isActive = false,
      children,
      ...props
    },
    ref
  ) => {
    const tooltipPositionClasses = {
      top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
      bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
      left: 'right-full mr-2 top-1/2 -translate-y-1/2',
      right: 'left-full ml-2 top-1/2 -translate-y-1/2',
    };

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}

        {tooltip && !isActive && (
          <span
            className={cn(
              'absolute px-3 py-2 text-sm text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50',
              'pointer-events-none',
              tooltipPositionClasses[tooltipSide]
            )}
          >
            {tooltip}
          </span>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };