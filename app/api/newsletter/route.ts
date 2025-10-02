import { NextResponse } from 'next/server';
import { sanitize } from '@/lib/utils';
import { verifyTurnstile } from '@/lib/captcha';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = sanitize(String(body.email ?? ''));
    const token = String(body.token ?? '');
    if (!email || !email.includes('@')) {
      return NextResponse.json({ message: 'Email inválido' }, { status: 400 });
    }
    const valid = await verifyTurnstile(token);
    if (!valid) {
      return NextResponse.json({ message: 'Falha na verificação de segurança' }, { status: 400 });
    }

    console.info('Newsletter signup', email);
    return NextResponse.json({ message: 'Inscrição realizada com sucesso' });
  } catch (error) {
    console.error('Newsletter error', error);
    return NextResponse.json({ message: 'Não foi possível realizar a inscrição' }, { status: 400 });
  }
}
