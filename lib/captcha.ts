import { headers } from 'next/headers';

export const verifyTurnstile = async (token: string) => {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn('TURNSTILE_SECRET_KEY não configurado, pulando verificação.');
    return true;
  }

  const ip = headers().get('x-forwarded-for') ?? undefined;
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      response: token,
      secret,
      remoteip: ip
    })
  });

  if (!response.ok) {
    console.error('Turnstile verification failed', await response.text());
    return false;
  }

  const data = (await response.json()) as { success: boolean };
  return data.success;
};
