import { NextResponse } from 'next/server';
import { usersRepository } from '@/lib/repositories/users';
import { acceptInviteSchema } from '@/lib/validators';
import { hashPassword, createSession } from '@/lib/auth';

export async function GET(_: Request, { params }: { params: { token: string } }) {
  const invite = usersRepository.findInviteByToken(params.token);
  if (!invite) {
    return NextResponse.json({ message: 'Convite inválido ou expirado' }, { status: 404 });
  }

  return NextResponse.json({
    email: invite.email,
    expiresAt: invite.expires_at,
    consultantId: invite.consultant_id
  });
}

export async function POST(request: Request, { params }: { params: { token: string } }) {
  try {
    const invite = usersRepository.findInviteByToken(params.token);
    if (!invite) {
      return NextResponse.json({ message: 'Convite inválido ou expirado' }, { status: 400 });
    }

    const data = await request.json();
    const parsed = acceptInviteSchema.parse({ ...data, token: params.token });

    const password_hash = await hashPassword(parsed.password);
    const user = await usersRepository.create({
      email: invite.email,
      password_hash,
      name: parsed.name,
      role: 'CLIENT',
      consultant_id: invite.consultant_id
    });

    usersRepository.markInviteAccepted(invite.id);

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      consultant_id: user.consultant_id
    });

    return NextResponse.json({ message: 'Convite aceito com sucesso' });
  } catch (error) {
    console.error('Accept invite error', error);
    return NextResponse.json({ message: 'Não foi possível aceitar o convite' }, { status: 400 });
  }
}
