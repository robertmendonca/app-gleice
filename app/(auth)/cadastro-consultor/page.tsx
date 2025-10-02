'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { registerConsultantSchema } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormProvider, FormField, FormActions, FormError, FormSuccess } from '@/components/ui/form';
import { TurnstileWidget } from '@/components/security/turnstile';

const schema = registerConsultantSchema;
type FormData = z.infer<typeof schema>;

export default function ConsultantRegisterPage() {
  const router = useRouter();
  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmation: '',
      token: ''
    }
  });
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data)
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message ?? 'Não foi possível concluir o cadastro');
        return;
      }
      setSuccess(result.message);
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
        <span className="text-xs uppercase tracking-[0.4em] text-foreground/50">Primeiro acesso</span>
        <h2 className="text-2xl font-semibold text-foreground">Crie sua conta consultora</h2>
        <p className="text-sm text-foreground/60">
          O primeiro cadastro torna-se administrador; demais cadastros atuam como consultores.
        </p>
      </header>
      <FormProvider form={form}>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <FormField<FormData> name="name" label="Nome completo">
            {(field) => <Input type="text" placeholder="Seu nome" {...field} />}
          </FormField>
          <FormField<FormData> name="email" label="Email profissional">
            {(field) => <Input type="email" placeholder="contato@estudio.com" {...field} />}
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField<FormData> name="password" label="Senha">
              {(field) => <Input type="password" placeholder="Crie uma senha" {...field} />}
            </FormField>
            <FormField<FormData> name="confirmation" label="Confirmação">
              {(field) => <Input type="password" placeholder="Repita a senha" {...field} />}
            </FormField>
          </div>
          <input type="hidden" {...form.register('token')} />
          <TurnstileWidget onVerify={setToken} />
          <FormError message={error} />
          <FormSuccess message={success} />
          <FormActions>
            <Button type="submit" disabled={pending} className="btn-gradient">
              {pending ? 'Cadastrando...' : 'Criar acesso'}
            </Button>
            <p className="text-sm text-foreground/60">
              Já possui conta?{' '}
              <Link href="/login" className="font-semibold text-foreground hover:underline">
                Entrar
              </Link>
            </p>
          </FormActions>
        </form>
      </FormProvider>
    </div>
  );
}
