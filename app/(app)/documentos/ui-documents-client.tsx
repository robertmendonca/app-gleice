'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useSession } from '@/components/providers/session-provider';

interface DocumentRecord {
  id: string;
  consultant_id: string;
  client_id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  client_name: string;
  consultant_name: string;
}

interface ClientSummary {
  id: string;
  name: string;
  email: string;
}

export function DocumentsClient() {
  const session = useSession();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ clientId: '' });

  const canApprove = session.role !== 'CLIENT';

  const loadDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (!response.ok) throw new Error('Erro ao carregar documentos');
      const data = await response.json();
      setDocuments(data.documents ?? []);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar os documentos.');
    }
  };

  const loadClients = async () => {
    if (session.role === 'CLIENT') return;
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
    loadDocuments();
    loadClients();
  }, []);

  const handleUpload = async (file: File) => {
    setError(undefined);
    setSuccess(undefined);
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      if (session.role !== 'CLIENT') {
        body.append('clientId', formData.clientId);
        body.append('consultantId', session.id);
      }
      const response = await fetch('/api/documents', {
        method: 'POST',
        body
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? 'Erro ao enviar documento');
      setSuccess('Documento enviado com sucesso.');
      loadDocuments();
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? 'Não foi possível enviar o documento');
    } finally {
      setUploading(false);
    }
  };

  const updateStatus = async (document: DocumentRecord, status: DocumentRecord['status']) => {
    try {
      const response = await fetch(`/api/documents/${document.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? 'Erro ao atualizar documento');
      setSuccess('Documento atualizado.');
      loadDocuments();
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? 'Não foi possível atualizar o documento');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-foreground">Documentos compartilhados</h2>
          <p className="text-sm text-foreground/60">
            Centralize contratos, fotos de referência e briefings com controle de aprovação.
          </p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          {session.role !== 'CLIENT' && (
            <select
              value={formData.clientId}
              onChange={(event) => setFormData({ clientId: event.target.value })}
              className="h-11 rounded-2xl border border-foreground/10 bg-white px-4 text-sm"
            >
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          )}
          <Button asChild className="btn-gradient" disabled={uploading}>
            <label className="cursor-pointer">
              {uploading ? 'Enviando...' : 'Enviar documento'}
              <input
                type="file"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    handleUpload(file);
                  }
                }}
              />
            </label>
          </Button>
        </div>
      </header>
      {error && <div className="rounded-3xl bg-red-50 p-4 text-sm text-red-600">{error}</div>}
      {success && <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700">{success}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        {documents.map((document) => (
          <Card key={document.id} className="bg-white/80">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">{document.original_name}</CardTitle>
              <CardDescription className="text-sm text-foreground/60">
                {formatDistanceToNow(new Date(document.created_at), { addSuffix: true, locale: ptBR })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">{document.status}</p>
              <p className="text-sm text-foreground/60">
                Cliente: {document.client_name} · Consultor: {document.consultant_name}
              </p>
              <a
                href={document.filename}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-foreground underline-offset-4 hover:underline"
              >
                Baixar documento
              </a>
              {canApprove && (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => updateStatus(document, 'APPROVED')}>
                    Aprovar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => updateStatus(document, 'REJECTED')}>
                    Solicitar ajuste
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {documents.length === 0 && (
          <div className="rounded-3xl bg-white/80 p-6 text-sm text-foreground/60">
            Nenhum documento enviado até o momento.
          </div>
        )}
      </div>
    </div>
  );
}
