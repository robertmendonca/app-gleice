'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from '@/components/providers/session-provider';

interface Appointment {
  id: string;
  consultant_id: string;
  client_id: string;
  start_at: string;
  end_at: string;
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'COMPLETED';
  notes: string | null;
  consultant_name: string;
  client_name: string;
}

interface ClientSummary {
  id: string;
  name: string;
  email: string;
}

export function AppointmentsClient() {
  const session = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ clientId: '', startAt: '', endAt: '', notes: '' });
  const [successMessage, setSuccessMessage] = useState<string | undefined>();

  const canManage = session.role !== 'CLIENT';

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/appointments');
      if (!response.ok) throw new Error('Erro ao carregar agenda');
      const data = await response.json();
      setAppointments(data.appointments ?? []);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar os agendamentos.');
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    if (!canManage) return;
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) throw new Error('Erro ao carregar clientes');
      const data = await response.json();
      setClients(data.clients ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAppointments();
    loadClients();
  }, []);

  const submitAppointment = async () => {
    setError(undefined);
    try {
      const payload = {
        clientId: formData.clientId,
        startAt: formData.startAt,
        endAt: formData.endAt,
        notes: formData.notes
      };
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? 'Erro ao agendar');
      setSuccessMessage('Agendamento criado com sucesso.');
      setShowForm(false);
      setFormData({ clientId: '', startAt: '', endAt: '', notes: '' });
      loadAppointments();
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? 'Não foi possível criar o agendamento');
    }
  };

  const updateStatus = async (appointment: Appointment, status: Appointment['status']) => {
    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startAt: appointment.start_at,
          endAt: appointment.end_at,
          notes: appointment.notes,
          status
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? 'Erro ao atualizar');
      setSuccessMessage('Agendamento atualizado.');
      loadAppointments();
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? 'Não foi possível atualizar o agendamento');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-foreground">Agenda de consultorias</h2>
          <p className="text-sm text-foreground/60">
            Acompanhe solicitações, confirme horários e mantenha histórico de atendimentos.
          </p>
        </div>
        {canManage && (
          <Button className="btn-gradient" onClick={() => setShowForm(true)}>
            Novo agendamento
          </Button>
        )}
      </div>
      {error && <div className="rounded-3xl bg-red-50 p-4 text-sm text-red-600">{error}</div>}
      {successMessage && (
        <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700">{successMessage}</div>
      )}
      {loading ? (
        <div className="rounded-3xl bg-white/80 p-8 text-sm text-foreground/60">Carregando agenda...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="bg-white/80">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">
                  {format(new Date(appointment.start_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </CardTitle>
                <CardDescription className="text-sm text-foreground/60">
                  {session.role === 'CLIENT'
                    ? appointment.consultant_name
                    : `Cliente: ${appointment.client_name}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">{appointment.status}</p>
                {appointment.notes && <p className="text-sm text-foreground/60">{appointment.notes}</p>}
                <div className="flex flex-wrap gap-2">
                  {session.role === 'CLIENT' ? (
                    <>
                      {appointment.status === 'PENDING' && (
                        <Button size="sm" variant="ghost" onClick={() => updateStatus(appointment, 'CONFIRMED')}>
                          Confirmar
                        </Button>
                      )}
                      {appointment.status === 'PENDING' && (
                        <Button size="sm" variant="ghost" onClick={() => updateStatus(appointment, 'DECLINED')}>
                          Reagendar
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => updateStatus(appointment, 'CONFIRMED')}>
                        Confirmar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => updateStatus(appointment, 'COMPLETED')}>
                        Marcar como concluído
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => updateStatus(appointment, 'DECLINED')}>
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {appointments.length === 0 && (
            <div className="rounded-3xl bg-white/80 p-6 text-sm text-foreground/60">
              Nenhum agendamento encontrado.
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="rounded-3xl border border-foreground/10 bg-white/90 p-6 shadow-soft"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Novo agendamento</h3>
                  <p className="text-sm text-foreground/60">
                    Defina data, horário e observações para a sessão personalizada.
                  </p>
                </div>
                <Button variant="ghost" onClick={() => setShowForm(false)}>
                  Fechar
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-foreground/50">Cliente</label>
                  <select
                    value={formData.clientId}
                    onChange={(event) => setFormData((prev) => ({ ...prev, clientId: event.target.value }))}
                    className="h-11 w-full rounded-2xl border border-foreground/10 bg-white px-4 text-sm"
                  >
                    <option value="">Selecione um cliente</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-foreground/50">Início</label>
                  <Input
                    type="datetime-local"
                    value={formData.startAt}
                    onChange={(event) => setFormData((prev) => ({ ...prev, startAt: event.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-foreground/50">Fim</label>
                  <Input
                    type="datetime-local"
                    value={formData.endAt}
                    onChange={(event) => setFormData((prev) => ({ ...prev, endAt: event.target.value }))}
                  />
                </div>
              </div>
              <Textarea
                placeholder="Notas ou briefing"
                value={formData.notes}
                onChange={(event) => setFormData((prev) => ({ ...prev, notes: event.target.value }))}
              />
              <div className="flex justify-end">
                <Button className="btn-gradient" onClick={submitAppointment}>
                  Agendar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
