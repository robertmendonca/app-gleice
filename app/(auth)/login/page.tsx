'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { loginSchema } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormProvider, FormField, FormError, FormActions } from '@/components/ui/form';
import { TurnstileWidget } from '@/components/security/turnstile';

const schema = loginSchema;
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<FormData>({
    defaultValues: { email: '', password: '', token: '' }
  });
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    if (token) {
      form.setValue('token', token);
    }
  }, [token, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setError(undefined);
    const parsed = schema.safeParse({ ...values, token });
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field && typeof field === 'string') {
          form.setError(field as keyof FormData, { message: issue.message });
        } else {
          setError(issue.message);
        }
      });
      return;
    }
    setPending(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data)
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message ?? 'Falha no login');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Não foi possível conectar. Tente novamente.');
    } finally {
      setPending(false);
    }
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 text-center">
        <span className="text-xs uppercase tracking-[0.4em] text-foreground/50">Bem-vinda de volta</span>
        <h2 className="text-2xl font-semibold text-foreground">Acesse sua conta</h2>
        <p className="text-sm text-foreground/60">
          Painel seguro para gerir clientes, lookbooks e consultorias.
        </p>
      </header>
      <FormProvider form={form}>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <FormField<FormData> name="email" label="Email">
            {(field) => <Input type="email" placeholder="voce@exemplo.com" {...field} />}
          </FormField>
          <FormField<FormData> name="password" label="Senha">
            {(field) => <Input type="password" placeholder="••••••••" {...field} />}
          </FormField>
          <input type="hidden" {...form.register('token')} />
          <TurnstileWidget onVerify={setToken} />
          <FormError message={error} />
          <FormActions>
            <Button type="submit" disabled={pending} className="btn-gradient">
              {pending ? 'Entrando...' : 'Entrar' }
            </Button>
            <div className="text-sm text-foreground/60">
              <Link href="/esqueci-senha" className="underline-offset-4 hover:underline">
                Esqueci minha senha
              </Link>
            </div>
          </FormActions>
        </form>
      </FormProvider>
      <p className="text-center text-sm text-foreground/60">
        Ainda não é consultora?{' '}
        <Link href="/cadastro-consultor" className="font-semibold text-foreground hover:underline">
          Crie seu acesso
        </Link>
      </p>
    </div>
  );
}
