import { Suspense } from 'react';
import { AcceptInviteForm } from './ui-accept-invite';

export default function InvitePage({ params }: { params: { token: string } }) {
  return (
    <Suspense fallback={<div className="text-center text-sm text-foreground/60">Carregando convite...</div>}>
      <AcceptInviteForm token={params.token} />
    </Suspense>
  );
}
