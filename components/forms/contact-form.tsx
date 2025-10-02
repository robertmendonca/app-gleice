'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { TurnstileWidget } from '@/components/security/turnstile';

export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '', token: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('loading');
    setError(undefined);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message ?? 'Erro ao enviar mensagem');
      }
      setStatus('success');
      setForm({ name: '', email: '', message: '', token: '' });
    } catch (err: any) {
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          placeholder="Nome completo"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          required
        />
        <Input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          required
        />
      </div>
      <Textarea
        placeholder="Como podemos transformar sua imagem?"
        value={form.message}
        onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
        required
      />
      <TurnstileWidget onVerify={(token) => setForm((prev) => ({ ...prev, token }))} />
      {status === 'error' && <p className="text-sm text-red-600">{error}</p>}
      {status === 'success' && <p className="text-sm text-emerald-600">Mensagem enviada com sucesso.</p>}
      <Button className="btn-gradient" type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Enviando...' : 'Enviar mensagem'}
      </Button>
    </form>
  );
}
