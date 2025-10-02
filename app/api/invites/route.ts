import { NextResponse } from 'next/server';
import { inviteClientSchema } from '@/lib/validators';
import { usersRepository } from '@/lib/repositories/users';
import { getSessionUser } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export async function GET() {
  const session = getSessionUser();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  const invites = usersRepository.listInvitesForUser(session.id, session.role);
  return NextResponse.json({ invites });
}

export async function POST(request: Request) {
  const session = getSessionUser();
  if (!session || (session.role !== 'CONSULTANT' && session.role !== 'ADMIN')) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const parsed = inviteClientSchema.parse({
      ...data,
      consultantId: session.role === 'CONSULTANT' ? session.id : data.consultantId
    });

    const invite = usersRepository.createInvite({
      email: parsed.email,
      role: 'CLIENT',
      consultantId: parsed.consultantId,
      createdBy: session.id
    });

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/convite/${invite.token}`;
    await sendEmail({
      to: parsed.email,
      subject: 'Convite para acesso - Gleice Monteiro',
      html: `<p>Você foi convidado(a) para acessar a plataforma de consultoria de imagem Gleice Monteiro.</p><p>O convite expira em 24h.</p><p><a href="${inviteUrl}">Acesse aqui</a></p>`
    });

    return NextResponse.json({ invite });
  } catch (error) {
    console.error('Invite error', error);
    return NextResponse.json({ message: 'Não foi possível gerar o convite' }, { status: 400 });
  }
}
