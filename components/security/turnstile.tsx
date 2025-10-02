'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: { sitekey: string; callback: (token: string) => void }) => void;
      reset: (widgetId?: string) => void;
    };
  }
}

export const TurnstileWidget = ({ onVerify }: { onVerify: (token: string) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const render = () => {
      if (!containerRef.current) return;
      if (!window.turnstile) {
        timeout = setTimeout(render, 500);
        return;
      }
      window.turnstile.render(containerRef.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '',
        callback: (token: string) => onVerify(token)
      });
    };
    render();
    return () => clearTimeout(timeout);
  }, [onVerify]);

  if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
    useEffect(() => {
      onVerify('dev-token');
    }, [onVerify]);
    return null;
  }

  return <div ref={containerRef} className="mt-4" />;
};
