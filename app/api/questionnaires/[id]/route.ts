import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { questionnairesRepository } from '@/lib/repositories/questionnaires';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = getSessionUser();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  const questionnaire = questionnairesRepository.getById(params.id);
  if (!questionnaire) {
    return NextResponse.json({ message: 'Questionário não encontrado' }, { status: 404 });
  }

  return NextResponse.json({ questionnaire });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = getSessionUser();
  if (!session || session.role === 'CLIENT') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const questionnaire = questionnairesRepository.update(params.id, session.id, payload);
    return NextResponse.json({ questionnaire });
  } catch (error) {
    console.error('Questionnaire update error', error);
    return NextResponse.json({ message: 'Não foi possível atualizar' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = getSessionUser();
  if (!session || session.role === 'CLIENT') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    questionnairesRepository.delete(params.id, session.id);
    return NextResponse.json({ message: 'Questionário removido' });
  } catch (error) {
    console.error('Questionnaire delete error', error);
    return NextResponse.json({ message: 'Não foi possível remover' }, { status: 400 });
  }
}
