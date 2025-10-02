import { cn } from '@/lib/cn';

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-2xl bg-foreground/10', className)} />
);
