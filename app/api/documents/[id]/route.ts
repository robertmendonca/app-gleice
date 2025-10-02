import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { documentsRepository } from '@/lib/repositories/documents';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = getSessionUser();
  if (!session || session.role === 'CLIENT') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    documentsRepository.updateStatus(params.id, session.id, body.status);
    return NextResponse.json({ message: 'Documento atualizado' });
  } catch (error) {
    console.error('Document update error', error);
    return NextResponse.json({ message: 'Não foi possível atualizar' }, { status: 400 });
  }
}
