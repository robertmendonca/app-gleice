'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from '@/components/providers/session-provider';
import { Badge } from '@/components/ui/badge';

interface LookbookItem {
  id?: string;
  image_url: string;
  description: string | null;
  tags: string[];
}

interface Lookbook {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  client_id: string | null;
  cover_image: string | null;
  items: LookbookItem[];
}

interface ClientSummary {
  id: string;
  name: string;
  email: string;
}

const emptyItem = (): LookbookItem => ({ image_url: '', description: '', tags: [] });

export function LookbooksClient() {
  const session = useSession();
  const [lookbooks, setLookbooks] = useState<Lookbook[]>([]);
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Lookbook | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    clientId: '',
    items: [emptyItem()]
  });
  const [successMessage, setSuccessMessage] = useState<string | undefined>();

  const canManage = session.role !== 'CLIENT';

  const loadLookbooks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/lookbooks');
      if (!response.ok) throw new Error('Erro ao carregar lookbooks');
      const data = await response.json();
      setLookbooks((data.lookbooks ?? []).map((lookbook: any) => ({
        ...lookbook,
        tags: Array.isArray(lookbook.tags) ? lookbook.tags : lookbook.tags ? JSON.parse(lookbook.tags) : [],
        items: (lookbook.items ?? []).map((item: any) => ({
          ...item,
          tags: Array.isArray(item.tags) ? item.tags : item.tags ? JSON.parse(item.tags) : []
        }))
      })));
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar os lookbooks.');
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
    loadLookbooks();
    loadClients();
  }, []);

  const startCreate = () => {
    setEditing(null);
    setFormData({ title: '', description: '', tags: '', clientId: '', items: [emptyItem()] });
    setShowForm(true);
  };

  const startEdit = async (lookbook: Lookbook) => {
    try {
      const response = await fetch(`/api/lookbooks/${lookbook.id}`);
      if (!response.ok) throw new Error('Erro ao carregar lookbook');
      const data = await response.json();
      const lb = data.lookbook as Lookbook;
      setEditing(lb);
      setFormData({
        title: lb.title,
        description: lb.description ?? '',
        tags: (lb.tags ?? []).join(', '),
        clientId: lb.client_id ?? '',
        items: (lb.items ?? []).map((item) => ({
          id: item.id,
          image_url: item.image_url,
          description: item.description ?? '',
          tags: item.tags ?? []
        }))
      });
      setShowForm(true);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar o lookbook selecionado.');
    }
  };

  const handleFileUpload = async (file: File, index: number) => {
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    const response = await fetch('/api/lookbooks/upload', {
      method: 'POST',
      body: formDataUpload
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message ?? 'Falha no upload');
    setFormData((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], image_url: result.url };
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setFormData((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const updateItem = (index: number, key: keyof LookbookItem, value: any) => {
    setFormData((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [key]: value };
      return { ...prev, items };
    });
  };

  const submitLookbook = async () => {
    setError(undefined);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        clientId: formData.clientId || null,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        items: formData.items.map((item, index) => ({
          id: item.id,
          imageUrl: item.image_url,
          description: item.description,
          tags: item.tags
        })),
        coverImage: formData.items[0]?.image_url ?? null
      };
      const response = await fetch(editing ? `/api/lookbooks/${editing.id}` : '/api/lookbooks', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? 'Erro ao salvar lookbook');
      setSuccessMessage(editing ? 'Lookbook atualizado.' : 'Lookbook criado.');
      setShowForm(false);
      setEditing(null);
      setFormData({ title: '', description: '', tags: '', clientId: '', items: [emptyItem()] });
      loadLookbooks();
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? 'Não foi possível salvar o lookbook');
    }
  };

  const deleteLookbook = async (lookbook: Lookbook) => {
    if (!confirm('Deseja remover este lookbook?')) return;
    try {
      const response = await fetch(`/api/lookbooks/${lookbook.id}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? 'Erro ao remover');
      setSuccessMessage('Lookbook removido.');
      loadLookbooks();
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? 'Não foi possível remover o lookbook');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-foreground">Lookbooks exclusivos</h2>
          <p className="text-sm text-foreground/60">
            Crie coleções visuais com peças, combinações e moods personalizados para cada cliente.
          </p>
        </div>
        {canManage && (
          <Button onClick={startCreate} className="btn-gradient">
            Criar lookbook
          </Button>
        )}
      </div>
      {error && <div className="rounded-3xl bg-red-50 p-4 text-sm text-red-600">{error}</div>}
      {successMessage && (
        <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700">{successMessage}</div>
      )}
      {loading ? (
        <div className="rounded-3xl bg-white/80 p-8 text-sm text-foreground/60">Carregando inspirações...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lookbooks.map((lookbook) => (
            <Card key={lookbook.id} className="overflow-hidden bg-white/80">
              {lookbook.cover_image && (
                <div className="relative h-48 w-full">
                  <Image src={lookbook.cover_image} alt={lookbook.title} fill className="object-cover" />
                </div>
              )}
              <CardHeader>
                <CardTitle>{lookbook.title}</CardTitle>
                {lookbook.description && (
                  <CardDescription className="text-sm text-foreground/60">{lookbook.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {(lookbook.tags ?? []).map((tag) => (
                    <Badge key={tag} className="bg-foreground/5 text-foreground/70">
                      #{tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">
                  {lookbook.items.length} peças
                </p>
                {canManage && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(lookbook)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteLookbook(lookbook)}>
                      Excluir
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {lookbooks.length === 0 && (
            <div className="rounded-3xl bg-white/80 p-6 text-sm text-foreground/60">
              Nenhum lookbook disponível no momento.
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
                  <h3 className="text-xl font-semibold text-foreground">
                    {editing ? 'Editar lookbook' : 'Novo lookbook'}
                  </h3>
                  <p className="text-sm text-foreground/60">
                    Compartilhe moodboards, referências e combinações para encantar clientes.
                  </p>
                </div>
                <Button variant="ghost" onClick={() => setShowForm(false)}>
                  Fechar
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  placeholder="Título"
                  value={formData.title}
                  onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                />
                <Input
                  placeholder="Tags (separadas por vírgula)"
                  value={formData.tags}
                  onChange={(event) => setFormData((prev) => ({ ...prev, tags: event.target.value }))}
                />
              </div>
              <Textarea
                placeholder="Descrição do lookbook"
                value={formData.description}
                onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
              />
              {canManage && (
                <div className="grid gap-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-foreground/50">Cliente</label>
                  <select
                    value={formData.clientId}
                    onChange={(event) => setFormData((prev) => ({ ...prev, clientId: event.target.value }))}
                    className="h-11 w-full rounded-2xl border border-foreground/10 bg-white px-4 text-sm"
                  >
                    <option value="">Não atribuir</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="rounded-3xl border border-foreground/10 bg-white/80 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <p className="text-sm font-semibold text-foreground">Peça {index + 1}</p>
                      <Button variant="ghost" size="sm" onClick={() => removeItem(index)}>
                        Remover
                      </Button>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <Input
                        placeholder="URL da imagem"
                        value={item.image_url}
                        onChange={(event) => updateItem(index, 'image_url', event.target.value)}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            try {
                              await handleFileUpload(file, index);
                            } catch (err) {
                              console.error(err);
                              setError('Falha ao enviar a imagem.');
                            }
                          }
                        }}
                      />
                    </div>
                    <Textarea
                      className="mt-3"
                      placeholder="Descrição da peça"
                      value={item.description ?? ''}
                      onChange={(event) => updateItem(index, 'description', event.target.value)}
                    />
                    <Input
                      className="mt-3"
                      placeholder="Tags (separadas por vírgula)"
                      value={(item.tags ?? []).join(', ')}
                      onChange={(event) =>
                        updateItem(index, 'tags', event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean))
                      }
                    />
                  </div>
                ))}
                <Button variant="ghost" onClick={addItem}>
                  Adicionar peça
                </Button>
              </div>
              <div className="flex justify-end">
                <Button className="btn-gradient" onClick={submitLookbook}>
                  {editing ? 'Salvar alterações' : 'Publicar lookbook'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
