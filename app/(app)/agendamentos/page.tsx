import { Suspense } from 'react';
import { AppointmentsClient } from './ui-appointments-client';

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<div className="rounded-3xl bg-white/70 p-6">Carregando agenda...</div>}>
      <AppointmentsClient />
    </Suspense>
  );
}
