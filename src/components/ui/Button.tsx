import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';


//Define all button styles using cva
const buttonVariants = cva(
    // Base styles applied to all variants
    'relative group inline-flex items-center justify-center rounded-full font-medium transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed',
    {
        variants: {
            // Different button types
            variant: {
                primary:
                    'bg-blue-950 text-white shadow-lg hover:shadow-xl hover:bg-blue-900 hover:scale-105',
                secondary:
                    'bg-white text-gray-900 shadow-lg border border-gray-200 hover:scale-105',
                ghost:
                    'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800 border border-neutral-200',
                danger:
                    'bg-red-500 text-white shadow-lg hover:shadow-xl hover:bg-red-600 hover:scale-105',
                'menu-item':
                    'w-full justify-start text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-none disabled:opacity-50',
            },
            // Different button sizes
            size: {
                default: 'p-4', // Your standard 56x56 icon button
                sm: 'w-10 h-10', // For the modal close button
                full: 'h-12 flex-1', // For the modal action buttons
                'menu-item': 'h-auto', // Use the height from the 'menu-item' variant's padding
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
}
//  Create the component
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant,
            size,
            tooltip,
            tooltipSide = 'top', 
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

                {tooltip && (
                    <span
                        className={cn(
                            'absolute px-3 py-2 text-sm text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50',
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