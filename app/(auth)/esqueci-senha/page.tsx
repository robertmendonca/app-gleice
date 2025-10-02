'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { resetPasswordRequestSchema } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormProvider, FormField, FormError, FormSuccess, FormActions } from '@/components/ui/form';
import { TurnstileWidget } from '@/components/security/turnstile';

const schema = resetPasswordRequestSchema.extend({ token: z.string().min(10) });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const form = useForm<FormData>({ defaultValues: { email: '', token: '' } });
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    if (token) {
      form.setValue('token', token);
    }
  }, [token, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setError(undefined);
    setSuccess(undefined);
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
      const response = await fetch('/api/auth/reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data)
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message ?? 'Não foi possível enviar as instruções');
        return;
      }
      setSuccess('Se o email estiver cadastrado, enviamos as instruções de redefinição.');
      form.reset({ email: '', token: '' });
    } catch (err) {
      console.error(err);
      setError('Não foi possível enviar as instruções. Tente novamente.');
    } finally {
      setPending(false);
    }
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 text-center">
        <span className="text-xs uppercase tracking-[0.4em] text-foreground/50">Redefinição</span>
        <h2 className="text-2xl font-semibold text-foreground">Esqueci minha senha</h2>
        <p className="text-sm text-foreground/60">
          Informe seu email para receber o link de redefinição. O link expira em 1 hora.
        </p>
      </header>
      <FormProvider form={form}>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <FormField<FormData> name="email" label="Email cadastrado">
            {(field) => <Input type="email" placeholder="voce@exemplo.com" {...field} />}
          </FormField>
          <input type="hidden" {...form.register('token')} />
          <TurnstileWidget onVerify={setToken} />
          <FormError message={error} />
          <FormSuccess message={success} />
          <FormActions>
            <Button type="submit" disabled={pending} className="btn-gradient">
              {pending ? 'Enviando...' : 'Enviar instruções'}
            </Button>
            <Link href="/login" className="text-sm text-foreground/60 underline-offset-4 hover:underline">
              Voltar ao login
            </Link>
          </FormActions>
        </form>
      </FormProvider>
    </div>
  );
}
