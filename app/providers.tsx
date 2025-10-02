'use client';

import { ReactNode, useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { DefaultSeo } from 'next-seo';
import { defaultSeo } from '@/config/seo';

export function Providers({ children, nonce }: { children: ReactNode; nonce?: string | null }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((error) => console.error('SW registration failed', error));
    }
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <DefaultSeo {...defaultSeo} />
      <div data-csp-nonce={nonce ?? undefined}>{children}</div>
    </MotionConfig>
  );
}
