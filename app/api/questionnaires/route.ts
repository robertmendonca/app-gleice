import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { questionnairesRepository } from '@/lib/repositories/questionnaires';

export async function GET() {
  const session = getSessionUser();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  const questionnaires = questionnairesRepository.listForUser(session.id, session.role);
  return NextResponse.json({ questionnaires });
}

export async function POST(request: Request) {
  const session = getSessionUser();
  if (!session || session.role === 'CLIENT') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const questionnaire = questionnairesRepository.create(session.id, payload);
    return NextResponse.json({ questionnaire });
  } catch (error) {
    console.error('Questionnaire create error', error);
    return NextResponse.json({ message: 'Não foi possível criar o questionário' }, { status: 400 });
  }
}
