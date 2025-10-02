import { NextResponse } from 'next/server';
import { resetPasswordSchema } from '@/lib/validators';
import { usersRepository } from '@/lib/repositories/users';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsed = resetPasswordSchema.parse(data);

    const reset = usersRepository.findResetToken(parsed.token);
    if (!reset) {
      return NextResponse.json({ message: 'Token inválido ou expirado' }, { status: 400 });
    }

    const passwordHash = await hashPassword(parsed.password);
    usersRepository.updatePassword(reset.user_id, passwordHash);
    usersRepository.deleteReset(reset.id);

    return NextResponse.json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error('Reset error', error);
    return NextResponse.json({ message: 'Não foi possível redefinir a senha' }, { status: 400 });
  }
}
