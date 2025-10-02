import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { questionnairesRepository } from '@/lib/repositories/questionnaires';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = getSessionUser();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const questionnaire = questionnairesRepository.getById(params.id);
    if (!questionnaire) {
      return NextResponse.json({ message: 'Questionário não encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const answers = body.answers as Record<string, string | string[]>;
    const response = questionnairesRepository.submitResponse(
      params.id,
      session.role === 'CLIENT' ? session.id : body.clientId,
      questionnaire.consultant_id,
      answers
    );

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Questionnaire response error', error);
    return NextResponse.json({ message: 'Não foi possível registrar as respostas' }, { status: 400 });
  }
}
