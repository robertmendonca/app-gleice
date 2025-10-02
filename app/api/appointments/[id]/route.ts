import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { appointmentsRepository } from '@/lib/repositories/appointments';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = getSessionUser();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    appointmentsRepository.update(params.id, {
      startAt: body.startAt,
      endAt: body.endAt,
      status: body.status,
      notes: body.notes
    });
    return NextResponse.json({ message: 'Atualizado' });
  } catch (error) {
    console.error('Appointment update error', error);
    return NextResponse.json({ message: 'Não foi possível atualizar' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = getSessionUser();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    appointmentsRepository.delete(params.id);
    return NextResponse.json({ message: 'Agendamento removido' });
  } catch (error) {
    console.error('Appointment delete error', error);
    return NextResponse.json({ message: 'Não foi possível remover' }, { status: 400 });
  }
}
