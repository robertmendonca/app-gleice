'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TurnstileWidget } from '@/components/security/turnstile';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('loading');
    setError(undefined);
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? 'Erro ao cadastrar');
      setStatus('success');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row md:items-center">
      <Input
        placeholder="Seu email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <TurnstileWidget onVerify={setToken} />
      <Button type="submit" disabled={status === 'loading'} className="btn-gradient">
        {status === 'loading' ? 'Enviando...' : 'Inscrever'}
      </Button>
      {status === 'error' && <p className="text-sm text-red-600">{error}</p>}
      {status === 'success' && <p className="text-sm text-emerald-600">Inscrição confirmada.</p>}
    </form>
  );
}
