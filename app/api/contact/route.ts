import { NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validators';
import { verifyTurnstile } from '@/lib/captcha';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.parse(body);
    const valid = await verifyTurnstile(parsed.token);
    if (!valid) {
      return NextResponse.json({ message: 'Falha na verificação de segurança' }, { status: 400 });
    }

    await sendEmail({
      to: process.env.CONTACT_EMAIL ?? 'contato@gleicemonteiro.com',
      subject: 'Novo contato de cliente - Gleice Monteiro',
      html: `<p>${parsed.name} (${parsed.email}) enviou uma mensagem:</p><p>${parsed.message}</p>`
    });

    return NextResponse.json({ message: 'Mensagem enviada com sucesso' });
  } catch (error) {
    console.error('Contact error', error);
    return NextResponse.json({ message: 'Não foi possível enviar sua mensagem' }, { status: 400 });
  }
}
