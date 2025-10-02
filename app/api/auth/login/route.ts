import { NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validators';
import { usersRepository } from '@/lib/repositories/users';
import { verifyPassword, createSession } from '@/lib/auth';
import { verifyTurnstile } from '@/lib/captcha';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsed = loginSchema.parse(data);

    const validToken = await verifyTurnstile(parsed.token);
    if (!validToken) {
      return NextResponse.json({ message: 'Falha na verificação de segurança' }, { status: 400 });
    }

    const user = usersRepository.findByEmail(parsed.email);
    if (!user) {
      return NextResponse.json({ message: 'Credenciais inválidas' }, { status: 401 });
    }

    const valid = await verifyPassword(parsed.password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ message: 'Credenciais inválidas' }, { status: 401 });
    }

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      consultant_id: user.consultant_id
    });

    return NextResponse.json({ message: 'Login realizado com sucesso', role: user.role });
  } catch (error) {
    console.error('Login error', error);
    return NextResponse.json({ message: 'Não foi possível realizar o login' }, { status: 400 });
  }
}
