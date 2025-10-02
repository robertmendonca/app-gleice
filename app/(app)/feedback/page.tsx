import { Suspense } from 'react';
import { FeedbackClient } from './ui-feedback-client';

export default function FeedbackPage() {
  return (
    <Suspense fallback={<div className="rounded-3xl bg-white/70 p-6">Carregando feedbacks...</div>}>
      <FeedbackClient />
    </Suspense>
  );
}
