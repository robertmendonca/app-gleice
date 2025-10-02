import { Suspense } from 'react';
import { LookbooksClient } from './ui-lookbooks-client';

export default function LookbooksPage() {
  return (
    <Suspense fallback={<div className="rounded-3xl bg-white/70 p-6">Carregando lookbooks...</div>}>
      <LookbooksClient />
    </Suspense>
  );
}
