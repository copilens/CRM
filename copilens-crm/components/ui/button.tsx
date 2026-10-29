import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:pointer-events-none disabled:opacity-50 active:scale-95 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-[#1B1B1C] text-[#FFFFFF] hover:bg-[#6ec93f]',
        primary: 'bg-[#1B1B1C] text-[#FFFFFF] hover:bg-[#1B1B1C]/95',
        secondary: 'bg-[#ecece5] text-[#14150f] hover:bg-[#e3e2da]',
        outline: 'border border-[rgba(14,16,10,0.12)] bg-transparent hover:bg-[#f4f3ef]',
        ghost: 'bg-transparent text-[#6f6e66] hover:bg-[#f4f3ef] hover:text-[#14150f]',
        danger: 'bg-[#f8dcda] text-[#bd453c] hover:bg-[#f3cac7]',
        dark: 'bg-[#1c1c1c] text-white hover:bg-black',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-6 text-base',
        icon: 'h-8 w-8 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
