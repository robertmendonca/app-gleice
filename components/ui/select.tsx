import * as React from 'react';
import { cn } from '@/lib/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'h-11 w-full rounded-2xl border border-foreground/10 bg-white px-4 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children}
  </select>
));

Select.displayName = 'Select';
