import { cn } from '@/lib/cn';
import { HTMLAttributes } from 'react';

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'rounded-3xl border border-foreground/10 bg-white/80 backdrop-blur shadow-soft px-6 py-6 md:px-8 md:py-8',
      className
    )}
    {...props}
  />
);

export const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-6 flex flex-col gap-2', className)} {...props} />
);

export const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-xl font-semibold tracking-tight text-foreground', className)} {...props} />
);

export const CardDescription = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-foreground/70', className)} {...props} />
);

export const CardContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-4', className)} {...props} />
);
