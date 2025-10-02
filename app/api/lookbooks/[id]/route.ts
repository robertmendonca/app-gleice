import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { lookbooksRepository } from '@/lib/repositories/lookbooks';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = getSessionUser();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  const lookbook = lookbooksRepository.getById(params.id);
  if (!lookbook) {
    return NextResponse.json({ message: 'Lookbook não encontrado' }, { status: 404 });
  }

  return NextResponse.json({ lookbook });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = getSessionUser();
  if (!session || session.role === 'CLIENT') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const lookbook = lookbooksRepository.update(params.id, session.id, {
      title: body.title,
      description: body.description,
      clientId: body.clientId,
      tags: body.tags,
      coverImage: body.coverImage,
      items: body.items ?? []
    });
    return NextResponse.json({ lookbook });
  } catch (error) {
    console.error('Lookbook update error', error);
    return NextResponse.json({ message: 'Não foi possível atualizar' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = getSessionUser();
  if (!session || session.role === 'CLIENT') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    lookbooksRepository.delete(params.id, session.id);
    return NextResponse.json({ message: 'Lookbook removido' });
  } catch (error) {
    console.error('Lookbook delete error', error);
    return NextResponse.json({ message: 'Não foi possível remover' }, { status: 400 });
  }
}
