import { Suspense } from 'react';
import { DocumentsClient } from './ui-documents-client';

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div className="rounded-3xl bg-white/70 p-6">Carregando documentos...</div>}>
      <DocumentsClient />
    </Suspense>
  );
}
