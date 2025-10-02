import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { feedbackRepository } from '@/lib/repositories/feedback';

export async function GET() {
  const session = getSessionUser();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  const feedback = feedbackRepository.listForUser(session.id, session.role);
  return NextResponse.json({ feedback });
}

export async function POST(request: Request) {
  const session = getSessionUser();
  if (!session || session.role !== 'CLIENT') {
    return NextResponse.json({ message: 'Somente clientes podem enviar feedback' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const consultantId = body.consultantId ?? session.consultantId;
    if (!consultantId) {
      return NextResponse.json({ message: 'Consultor não encontrado' }, { status: 400 });
    }
    const id = feedbackRepository.create({
      appointmentId: body.appointmentId,
      consultantId,
      clientId: session.id,
      rating: body.rating,
      comment: body.comment
    });
    return NextResponse.json({ id });
  } catch (error) {
    console.error('Feedback error', error);
    return NextResponse.json({ message: 'Não foi possível registrar o feedback' }, { status: 400 });
  }
}
