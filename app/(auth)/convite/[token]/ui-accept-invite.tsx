'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { acceptInviteSchema } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormProvider, FormField, FormError, FormSuccess, FormActions } from '@/components/ui/form';

const schema = acceptInviteSchema;
type FormData = z.infer<typeof schema>;

type InviteInfo = {
  email: string;
  expiresAt: string;
  consultantId: string | null;
};

export function AcceptInviteForm({ token }: { token: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const form = useForm<FormData>({
    defaultValues: {
      token,
      name: '',
      password: '',
      confirmation: ''
    }
  });

  useEffect(() => {
    const loadInvite = async () => {
      try {
        const response = await fetch(`/api/invites/${token}`);
        if (!response.ok) {
          throw new Error('Convite indisponível');
        }
        const data = (await response.json()) as InviteInfo;
        setInvite(data);
        setStatus('ready');
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    };
    loadInvite();
  }, [token]);

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
      const response = await fetch(`/api/invites/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data)
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message ?? 'Não foi possível aceitar o convite');
        return;
      }
      setSuccess('Convite aceito com sucesso! Redirecionando...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    } catch (err) {
      console.error(err);
      setError('Não foi possível aceitar o convite.');
    } finally {
      setPending(false);
    }
  });

  if (status === 'loading') {
    return <div className="text-center text-sm text-foreground/60">Validando convite...</div>;
  }

  if (status === 'error' || !invite) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-semibold text-foreground">Convite inválido ou expirado</h2>
        <p className="text-sm text-foreground/60">
          Solicite um novo convite ao seu consultor para acessar a plataforma.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 text-center">
        <span className="text-xs uppercase tracking-[0.4em] text-foreground/50">Convite exclusivo</span>
        <h2 className="text-2xl font-semibold text-foreground">Bem-vinda, {invite.email}</h2>
        <p className="text-sm text-foreground/60">
          Complete seus dados para acessar o lookbook e materiais personalizados criados para você.
        </p>
      </header>
      <FormProvider form={form}>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <input type="hidden" {...form.register('token')} />
          <FormField<FormData> name="name" label="Nome completo">
            {(field) => <Input type="text" placeholder="Seu nome" {...field} />}
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField<FormData> name="password" label="Senha">
              {(field) => <Input type="password" placeholder="Crie uma senha" {...field} />}
            </FormField>
            <FormField<FormData> name="confirmation" label="Confirmação">
              {(field) => <Input type="password" placeholder="Repita a senha" {...field} />}
            </FormField>
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <FormActions>
            <Button type="submit" disabled={pending} className="btn-gradient">
              {pending ? 'Criando acesso...' : 'Ativar conta'}
            </Button>
          </FormActions>
        </form>
      </FormProvider>
      <p className="text-center text-xs text-foreground/50">
        Convite válido até {new Date(invite.expiresAt).toLocaleString('pt-BR')}
      </p>
    </div>
  );
}
