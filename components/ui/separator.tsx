import { cn } from '@/lib/cn';
import { HTMLAttributes } from 'react';

export const Separator = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('h-px w-full bg-foreground/10', className)} {...props} />
);
