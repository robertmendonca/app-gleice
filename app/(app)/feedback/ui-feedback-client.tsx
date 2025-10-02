'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from '@/components/providers/session-provider';

interface FeedbackRecord {
  id: string;
  appointment_id: string;
  consultant_id: string;
  client_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  consultant_name: string;
  client_name: string;
}

interface AppointmentSummary {
  id: string;
  start_at: string;
  consultant_name: string;
}

export function FeedbackClient() {
  const session = useSession();
  const [feedback, setFeedback] = useState<FeedbackRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentSummary[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [formData, setFormData] = useState({ appointmentId: '', rating: 5, comment: '' });

  const canSubmit = session.role === 'CLIENT';

  const loadFeedback = async () => {
    try {
      const response = await fetch('/api/feedback');
      if (!response.ok) throw new Error('Erro ao carregar feedback');
      const data = await response.json();
      setFeedback(data.feedback ?? []);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar os feedbacks.');
    }
  };

  const loadAppointments = async () => {
    if (!canSubmit) return;
    try {
      const response = await fetch('/api/appointments');
      if (!response.ok) throw new Error('Erro ao carregar agendamentos');
      const data = await response.json();
      setAppointments(
        (data.appointments ?? []).map((appointment: any) => ({
          id: appointment.id,
          start_at: appointment.start_at,
          consultant_name: appointment.consultant_name
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadFeedback();
    loadAppointments();
  }, []);

  const submitFeedback = async () => {
    setError(undefined);
    setSuccess(undefined);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? 'Erro ao enviar feedback');
      setSuccess('Obrigada pelo seu feedback!');
      setFormData({ appointmentId: '', rating: 5, comment: '' });
      loadFeedback();
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? 'Não foi possível enviar seu feedback');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-foreground">Feedback das consultorias</h2>
          <p className="text-sm text-foreground/60">
            Analise percepções, fortaleça relacionamentos e aprimore a experiência premium.
          </p>
        </div>
      </header>
      {error && <div className="rounded-3xl bg-red-50 p-4 text-sm text-red-600">{error}</div>}
      {success && <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700">{success}</div>}

      {canSubmit && (
        <Card className="bg-white/80">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Compartilhe sua avaliação</CardTitle>
            <CardDescription className="text-sm text-foreground/60">
              Conte como foi a experiência para aperfeiçoarmos cada detalhe do atendimento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-[0.3em] text-foreground/50">Sessão</label>
              <select
                value={formData.appointmentId}
                onChange={(event) => setFormData((prev) => ({ ...prev, appointmentId: event.target.value }))}
                className="h-11 rounded-2xl border border-foreground/10 bg-white px-4 text-sm"
              >
                <option value="">Selecione uma sessão</option>
                {appointments.map((appointment) => (
                  <option key={appointment.id} value={appointment.id}>
                    {format(new Date(appointment.start_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })} · {appointment.consultant_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-[0.3em] text-foreground/50">Nota</label>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={formData.rating}
                onChange={(event) => setFormData((prev) => ({ ...prev, rating: Number(event.target.value) }))}
              />
              <p className="text-sm text-foreground/60">Avaliação: {formData.rating}/5</p>
            </div>
            <Textarea
              placeholder="Compartilhe sua opinião"
              value={formData.comment}
              onChange={(event) => setFormData((prev) => ({ ...prev, comment: event.target.value }))}
            />
            <Button className="btn-gradient" onClick={submitFeedback}>
              Enviar feedback
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {feedback.map((entry) => (
          <Card key={entry.id} className="bg-white/80">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">{entry.client_name}</CardTitle>
              <CardDescription className="text-sm text-foreground/60">
                {format(new Date(entry.created_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">Nota {entry.rating}/5</p>
              {entry.comment && <p className="text-sm text-foreground/70">“{entry.comment}”</p>}
              <p className="text-xs text-foreground/50">Consultor: {entry.consultant_name}</p>
            </CardContent>
          </Card>
        ))}
        {feedback.length === 0 && (
          <div className="rounded-3xl bg-white/80 p-6 text-sm text-foreground/60">
            Nenhum feedback registrado ainda.
          </div>
        )}
      </div>
    </div>
  );
}
