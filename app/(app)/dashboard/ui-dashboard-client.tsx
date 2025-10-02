'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSession } from '@/components/providers/session-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface MetricsResponse {
  metrics: {
    newClients: number;
    pendingInvites: number;
    pendingAppointments: number;
    lookbooksCreated: number;
    upcomingAppointments: Array<{
      id: string;
      start_at: string;
      end_at: string;
      status: string;
      consultant_name: string;
      client_name: string;
    }>;
    questionnaireProgress: Array<{
      title: string;
      total: number;
    }>;
  };
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } })
};

export function DashboardClient() {
  const session = useSession();
  const [metrics, setMetrics] = useState<MetricsResponse['metrics'] | null>(null);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/dashboard/metrics', { cache: 'no-store' });
        if (!response.ok) throw new Error('Erro ao carregar métricas');
        const data = (await response.json()) as MetricsResponse;
        setMetrics(data.metrics);
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar as métricas.');
      }
    };
    load();
  }, []);

  if (error) {
    return <div className="rounded-3xl bg-red-50 p-6 text-sm text-red-600">{error}</div>;
  }

  if (!metrics) {
    return <div className="rounded-3xl bg-white/70 p-8 text-sm text-foreground/60">Preparando a visão geral...</div>;
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
          Olá, {session.name.split(' ')[0]} — sua jornada de estilo está no controle.
        </h1>
        <p className="text-sm text-foreground/60">
          Acompanhe convites, agendas, feedbacks e lookbooks entregues com a precisão que seus clientes premium merecem.
        </p>
      </section>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Novos clientes (30d)', value: metrics.newClients, href: '/clientes' },
          { label: 'Convites pendentes', value: metrics.pendingInvites, href: '/clientes' },
          { label: 'Consultorias a confirmar', value: metrics.pendingAppointments, href: '/agendamentos' },
          { label: 'Lookbooks criados', value: metrics.lookbooksCreated, href: '/lookbooks' }
        ].map((item, index) => (
          <motion.div key={item.label} variants={cardVariants} initial="hidden" animate="visible" custom={index}>
            <Card className="bg-white/80">
              <CardHeader className="mb-0 flex flex-col gap-2">
                <CardTitle className="text-sm font-medium text-foreground/60">{item.label}</CardTitle>
                <CardDescription className="text-3xl font-semibold text-foreground">
                  {item.value}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" size="sm" className="px-0 text-foreground/70">
                  <Link href={item.href}>Ver detalhes →</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[2fr,1fr]">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={0.5}>
          <Card className="bg-white/80">
            <CardHeader>
              <CardTitle className="text-lg">Próximas consultorias</CardTitle>
              <CardDescription>Confirme horários e prepare os materiais com antecedência.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {metrics.upcomingAppointments.length === 0 ? (
                <p className="text-sm text-foreground/50">Sem agendamentos futuros no momento.</p>
              ) : (
                metrics.upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex flex-col gap-1 rounded-2xl border border-foreground/10 bg-white/60 p-4"
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {session.role === 'CLIENT' ? appointment.consultant_name : appointment.client_name}
                    </p>
                    <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">{appointment.status}</p>
                    <p className="text-sm text-foreground/60">
                      {format(new Date(appointment.start_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
        {session.role !== 'CLIENT' && (
          <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={0.7}>
            <Card className="bg-white/80">
              <CardHeader>
                <CardTitle className="text-lg">Questionários em destaque</CardTitle>
                <CardDescription>
                  Acompanhe quantos clientes já responderam seus diagnósticos de estilo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {metrics.questionnaireProgress.length === 0 ? (
                  <p className="text-sm text-foreground/50">Ainda não há respostas registradas.</p>
                ) : (
                  metrics.questionnaireProgress.map((item) => (
                    <div key={item.title} className="flex items-center justify-between rounded-2xl bg-white/60 px-4 py-3">
                      <span className="text-sm font-medium text-foreground/70">{item.title}</span>
                      <span className="text-sm font-semibold text-foreground">{item.total}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
