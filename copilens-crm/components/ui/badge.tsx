import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-colors select-none',
  {
    variants: {
      variant: {
        default: 'bg-[#ecece5] text-[#14150f]',
        agendada: 'bg-[#dff6bc] text-[#254a0e]',
        realizada: 'bg-[#dff6bc] text-[#254a0e]',
        remarcada: 'bg-[#e2e8f5] text-[#41577f]',
        cancelada: 'bg-[#ecece5] text-[#7a7a71]',
        lead: 'bg-[#1c1c1c] text-white',
        ativo: 'bg-[#dff6bc] text-[#254a0e]',
        inativo: 'bg-[#f6d3da] text-[#9c1338]',
        up: 'bg-[#dff6bc] text-[#254a0e]',
        down: 'bg-[#f8dcda] text-[#bd453c]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
