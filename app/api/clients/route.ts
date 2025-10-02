import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { clientsRepository } from '@/lib/repositories/clients';

export async function GET() {
  const session = getSessionUser();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  const clients = clientsRepository.listClients(session.id, session.role).map((client) => ({
    id: client.id,
    name: client.name,
    email: client.email
  }));
  return NextResponse.json({ clients });
}
