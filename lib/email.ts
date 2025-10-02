export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailPayload) => {
  if (!process.env.SMTP_API_URL) {
    console.info('Email (mock):', { to, subject });
    return { delivered: false, reason: 'SMTP_API_URL não configurado' };
  }

  await fetch(process.env.SMTP_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SMTP_API_TOKEN ?? ''}`
    },
    body: JSON.stringify({ to, subject, html })
  });

  return { delivered: true };
};
