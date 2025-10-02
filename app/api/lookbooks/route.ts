import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { lookbooksRepository } from '@/lib/repositories/lookbooks';

export async function GET() {
  const session = getSessionUser();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  const lookbooks = lookbooksRepository.listForUser(session.id, session.role).map((lookbook) => ({
    ...lookbook,
    tags: lookbook.tags ? JSON.parse(lookbook.tags) : []
  }));
  return NextResponse.json({ lookbooks });
}

export async function POST(request: Request) {
  const session = getSessionUser();
  if (!session || session.role === 'CLIENT') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const lookbook = lookbooksRepository.create(session.id, {
      title: body.title,
      description: body.description,
      clientId: body.clientId,
      tags: body.tags,
      coverImage: body.coverImage,
      items: body.items ?? []
    });
    return NextResponse.json({ lookbook });
  } catch (error) {
    console.error('Lookbook create error', error);
    return NextResponse.json({ message: 'Não foi possível criar o lookbook' }, { status: 400 });
  }
}
