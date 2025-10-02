import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dashboardRepository } from '@/lib/repositories/dashboard';

export async function GET() {
  const session = getSessionUser();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  const metrics = dashboardRepository.metrics(session.id, session.role);
  return NextResponse.json({ metrics });
}
