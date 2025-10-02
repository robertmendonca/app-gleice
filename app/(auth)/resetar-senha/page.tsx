'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';
import { resetPasswordSchema } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormProvider, FormField, FormError, FormSuccess, FormActions } from '@/components/ui/form';

const schema = resetPasswordSchema;
type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') ?? '';
  const form = useForm<FormData>({
    defaultValues: {
      token,
      password: '',
      confirmation: ''
    }
  });
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  const onSubmit = form.handleSubmit(async (values) => {
    setError(undefined);
    setSuccess(undefined);
    const parsed = schema.safeParse(values);
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
      const response = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data)
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message ?? 'Não foi possível redefinir a senha');
        return;
      }
      setSuccess('Senha redefinida com sucesso! Você já pode acessar sua conta.');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError('Não foi possível redefinir a senha. Tente novamente.');
    } finally {
      setPending(false);
    }
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 text-center">
        <span className="text-xs uppercase tracking-[0.4em] text-foreground/50">Nova senha</span>
        <h2 className="text-2xl font-semibold text-foreground">Defina sua nova senha</h2>
        <p className="text-sm text-foreground/60">
          Crie uma senha forte com pelo menos 8 caracteres.
        </p>
      </header>
      <FormProvider form={form}>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <input type="hidden" {...form.register('token')} />
          <FormField<FormData> name="password" label="Nova senha">
            {(field) => <Input type="password" placeholder="Nova senha" {...field} />}
          </FormField>
          <FormField<FormData> name="confirmation" label="Confirmar senha">
            {(field) => <Input type="password" placeholder="Repita a senha" {...field} />}
          </FormField>
          <FormError message={error} />
          <FormSuccess message={success} />
          <FormActions>
            <Button type="submit" disabled={pending} className="btn-gradient">
              {pending ? 'Salvando...' : 'Salvar nova senha'}
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
