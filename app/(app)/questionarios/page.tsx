import { Suspense } from 'react';
import { QuestionnairesClient } from './ui-questionnaires-client';

export default function QuestionnairesPage() {
  return (
    <Suspense fallback={<div className="rounded-3xl bg-white/70 p-6">Carregando questionários...</div>}>
      <QuestionnairesClient />
    </Suspense>
  );
}
