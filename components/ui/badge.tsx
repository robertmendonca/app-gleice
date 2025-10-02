import { cn } from '@/lib/cn';
import { HTMLAttributes } from 'react';

export const Badge = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full bg-foreground/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-foreground/80',
      className
    )}
    {...props}
  />
);
