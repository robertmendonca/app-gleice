import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { appointmentsRepository } from '@/lib/repositories/appointments';
import { clientsRepository } from '@/lib/repositories/clients';
import { sendEmail } from '@/lib/email';

export async function GET() {
  const session = getSessionUser();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  const appointments = appointmentsRepository.listForUser(session.id, session.role);
  return NextResponse.json({ appointments });
}

export async function POST(request: Request) {
  const session = getSessionUser();
  if (!session || session.role === 'CLIENT') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const id = appointmentsRepository.create({
      consultantId: session.role === 'ADMIN' ? body.consultantId ?? session.id : session.id,
      clientId: body.clientId,
      startAt: body.startAt,
      endAt: body.endAt,
      notes: body.notes
    });

    const client = clientsRepository.listClients(session.id, session.role).find((item) => item.id === body.clientId);
    if (client) {
      await sendEmail({
        to: client.email,
        subject: 'Novo agendamento de consultoria',
        html: `<p>Olá ${client.name.split(' ')[0]},</p><p>Uma nova sessão foi agendada para ${new Date(body.startAt).toLocaleString('pt-BR')}.</p>`
      });
    }

    return NextResponse.json({ id });
  } catch (error) {
    console.error('Appointment create error', error);
    return NextResponse.json({ message: 'Não foi possível criar o agendamento' }, { status: 400 });
  }
}
