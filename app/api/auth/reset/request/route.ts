import { NextResponse } from 'next/server';
import { resetPasswordRequestSchema } from '@/lib/validators';
import { usersRepository } from '@/lib/repositories/users';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsed = resetPasswordRequestSchema.parse(data);

    const user = usersRepository.findByEmail(parsed.email);
    if (!user) {
      return NextResponse.json({ message: 'Se um usuário existir, enviaremos instruções.' });
    }

    const reset = usersRepository.createPasswordReset(user.id);

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/resetar-senha?token=${reset.token}`;

    await sendEmail({
      to: user.email,
      subject: 'Redefinição de senha - Gleice Monteiro',
      html: `<p>Olá ${user.name.split(' ')[0]},</p><p>Acesse o link abaixo para redefinir sua senha. Ele expira em 1 hora.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
    });

    return NextResponse.json({ message: 'Se um usuário existir, enviaremos instruções.' });
  } catch (error) {
    console.error('Reset request error', error);
    return NextResponse.json({ message: 'Não foi possível processar a solicitação' }, { status: 400 });
  }
}
