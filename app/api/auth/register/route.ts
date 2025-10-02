import { NextResponse } from 'next/server';
import database from '@/lib/db';
import { registerConsultantSchema } from '@/lib/validators';
import { usersRepository } from '@/lib/repositories/users';
import { hashPassword, createSession } from '@/lib/auth';
import { sanitize } from '@/lib/utils';
import { verifyTurnstile } from '@/lib/captcha';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsed = registerConsultantSchema.parse(data);

    const validToken = await verifyTurnstile(parsed.token);
    if (!validToken) {
      return NextResponse.json({ message: 'Falha na verificação de segurança' }, { status: 400 });
    }

    const exists = usersRepository.findByEmail(parsed.email);
    if (exists) {
      return NextResponse.json({ message: 'Email já cadastrado' }, { status: 409 });
    }

    const password_hash = await hashPassword(parsed.password);

    const totalUsers = database.prepare(`SELECT COUNT(*) as total FROM users`).get() as { total: number };
    const role = totalUsers.total === 0 ? 'ADMIN' : 'CONSULTANT';

    const user = await usersRepository.create({
      email: parsed.email,
      password_hash,
      name: sanitize(parsed.name),
      role
    });

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      consultant_id: user.consultant_id
    });

    return NextResponse.json({
      message: role === 'ADMIN' ? 'Admin cadastrado com sucesso' : 'Consultor cadastrado com sucesso',
      role: user.role
    });
  } catch (error) {
    console.error('Register error', error);
    return NextResponse.json({ message: 'Não foi possível concluir o cadastro' }, { status: 400 });
  }
}
