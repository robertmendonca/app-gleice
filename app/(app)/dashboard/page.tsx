import { Suspense } from 'react';
import { DashboardClient } from './ui-dashboard-client';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="rounded-3xl bg-white/70 p-8 shadow-soft">Carregando métricas...</div>}>
      <DashboardClient />
    </Suspense>
  );
}
