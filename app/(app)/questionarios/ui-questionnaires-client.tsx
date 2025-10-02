'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useSession } from '@/components/providers/session-provider';
import { Badge } from '@/components/ui/badge';

interface QuestionnaireOption {
  id?: string;
  label: string;
  value: string;
}

interface QuestionnaireQuestion {
  id?: string;
  prompt: string;
  type: 'TEXT' | 'SINGLE' | 'MULTI' | 'SCALE';
  required?: boolean;
  options?: QuestionnaireOption[];
}

interface Questionnaire {
  id: string;
  title: string;
  description: string | null;
  consultant_id: string;
  questions?: QuestionnaireQuestion[];
}

const emptyQuestion = (): QuestionnaireQuestion => ({ prompt: '', type: 'TEXT', required: true, options: [] });

export function QuestionnairesClient() {
  const session = useSession();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Questionnaire | null>(null);
  const [formData, setFormData] = useState<{ title: string; description: string; questions: QuestionnaireQuestion[] }>(
    () => ({ title: '', description: '', questions: [emptyQuestion()] })
  );
  const [responding, setResponding] = useState<Questionnaire | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [successMessage, setSuccessMessage] = useState<string | undefined>();

  const canManage = session.role !== 'CLIENT';

  const loadQuestionnaires = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/questionnaires');
      if (!response.ok) throw new Error('Erro ao carregar questionários');
      const data = await response.json();
      setQuestionnaires(data.questionnaires ?? []);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar os questionários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestionnaires();
  }, []);

  const startCreate = () => {
    setEditing(null);
    setFormData({ title: '', description: '', questions: [emptyQuestion()] });
    setShowForm(true);
  };

  const startEdit = async (questionnaire: Questionnaire) => {
    try {
      const response = await fetch(`/api/questionnaires/${questionnaire.id}`);
      if (!response.ok) throw new Error('Erro ao carregar questionário');
      const data = await response.json();
      setEditing(questionnaire);
      setFormData({
        title: data.questionnaire.title,
        description: data.questionnaire.description ?? '',
        questions: data.questionnaire.questions ?? []
      });
      setShowForm(true);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar o questionário selecionado.');
    }
  };

  const updateQuestionField = (index: number, key: keyof QuestionnaireQuestion, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.questions];
      updated[index] = { ...updated[index], [key]: value };
      if ((key === 'type' && (value === 'TEXT' || value === 'SCALE')) || !updated[index].options) {
        updated[index].options = value === 'TEXT' || value === 'SCALE' ? [] : updated[index].options ?? [];
      }
      return { ...prev, questions: updated };
    });
  };

  const addQuestion = () => {
    setFormData((prev) => ({ ...prev, questions: [...prev.questions, emptyQuestion()] }));
  };

  const removeQuestion = (index: number) => {
    setFormData((prev) => ({ ...prev, questions: prev.questions.filter((_, i) => i !== index) }));
  };

  const addOption = (questionIndex: number) => {
    setFormData((prev) => {
      const updated = [...prev.questions];
      const options = updated[questionIndex].options ?? [];
      updated[questionIndex] = { ...updated[questionIndex], options: [...options, { label: '', value: '' }] };
      return { ...prev, questions: updated };
    });
  };

  const updateOption = (questionIndex: number, optionIndex: number, key: keyof QuestionnaireOption, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.questions];
      const options = [...(updated[questionIndex].options ?? [])];
      options[optionIndex] = { ...options[optionIndex], [key]: value };
      updated[questionIndex] = { ...updated[questionIndex], options };
      return { ...prev, questions: updated };
    });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setFormData((prev) => {
      const updated = [...prev.questions];
      const options = [...(updated[questionIndex].options ?? [])];
      options.splice(optionIndex, 1);
      updated[questionIndex] = { ...updated[questionIndex], options };
      return { ...prev, questions: updated };
    });
  };

  const submitQuestionnaire = async () => {
    setError(undefined);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        questions: formData.questions.map((question, index) => ({
          ...question,
          required: question.required ?? false,
          position: index
        }))
      };
      const response = await fetch(editing ? `/api/questionnaires/${editing.id}` : '/api/questionnaires', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message ?? 'Erro ao salvar questionário');
      }
      setSuccessMessage(editing ? 'Questionário atualizado.' : 'Questionário criado.');
      setShowForm(false);
      setEditing(null);
      setFormData({ title: '', description: '', questions: [emptyQuestion()] });
      loadQuestionnaires();
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? 'Não foi possível salvar o questionário');
    }
  };

  const deleteQuestionnaire = async (questionnaire: Questionnaire) => {
    if (!confirm('Deseja remover este questionário?')) return;
    try {
      const response = await fetch(`/api/questionnaires/${questionnaire.id}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? 'Erro ao remover');
      setSuccessMessage('Questionário removido.');
      loadQuestionnaires();
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? 'Não foi possível remover o questionário');
    }
  };

  const startRespond = async (questionnaire: Questionnaire) => {
    try {
      const response = await fetch(`/api/questionnaires/${questionnaire.id}`);
      if (!response.ok) throw new Error('Erro ao carregar questionário');
      const data = await response.json();
      setResponding(data.questionnaire);
      const initialAnswers: Record<string, string | string[]> = {};
      (data.questionnaire.questions ?? []).forEach((question: QuestionnaireQuestion) => {
        initialAnswers[question.id ?? ''] = question.type === 'MULTI' ? [] : '';
      });
      setAnswers(initialAnswers);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar o questionário para resposta.');
    }
  };

  const submitResponse = async () => {
    if (!responding) return;
    try {
      const response = await fetch(`/api/questionnaires/${responding.id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? 'Erro ao enviar respostas');
      setSuccessMessage('Respostas enviadas com sucesso.');
      setResponding(null);
      loadQuestionnaires();
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? 'Não foi possível registrar as respostas');
    }
  };

  const filteredQuestionnaires = useMemo(() => questionnaires, [questionnaires]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-foreground">Questionários de estilo</h2>
          <p className="text-sm text-foreground/60">Mapeie preferências, hábitos e objetivos para direcionar consultorias.</p>
        </div>
        {canManage && (
          <Button onClick={startCreate} className="btn-gradient">
            Criar questionário
          </Button>
        )}
      </div>
      {error && <div className="rounded-3xl bg-red-50 p-4 text-sm text-red-600">{error}</div>}
      {successMessage && (
        <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700">{successMessage}</div>
      )}
      {loading ? (
        <div className="rounded-3xl bg-white/80 p-8 text-sm text-foreground/60">Carregando informações...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredQuestionnaires.map((questionnaire) => (
            <Card key={questionnaire.id} className="bg-white/80">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">{questionnaire.title}</CardTitle>
                {questionnaire.description && (
                  <CardDescription className="text-sm text-foreground/60">
                    {questionnaire.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Badge className="self-start bg-accent/10 text-accent-foreground">
                  {(questionnaire.questions?.length ?? 0)} perguntas
                </Badge>
                <div className="flex flex-wrap gap-2">
                  {canManage && (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => startEdit(questionnaire)}>
                        Editar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteQuestionnaire(questionnaire)}>
                        Excluir
                      </Button>
                    </>
                  )}
                  {session.role === 'CLIENT' && (
                    <Button size="sm" variant="ghost" onClick={() => startRespond(questionnaire)}>
                      Responder
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredQuestionnaires.length === 0 && (
            <div className="rounded-3xl bg-white/80 p-6 text-sm text-foreground/60">
              Nenhum questionário cadastrado ainda.
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
                    {editing ? 'Editar questionário' : 'Novo questionário'}
                  </h3>
                  <p className="text-sm text-foreground/60">
                    Estruture perguntas para entender personalidade, estilo de vida e expectativas.
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
                  placeholder="Descrição"
                  value={formData.description}
                  onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                />
              </div>
              <div className="space-y-5">
                {formData.questions.map((question, index) => (
                  <div key={index} className="rounded-3xl border border-foreground/10 bg-white/80 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <Textarea
                        placeholder="Pergunta"
                        value={question.prompt}
                        onChange={(event) => updateQuestionField(index, 'prompt', event.target.value)}
                      />
                      <Button variant="ghost" size="sm" onClick={() => removeQuestion(index)}>
                        Remover
                      </Button>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <Select
                        value={question.type}
                        onChange={(event) => updateQuestionField(index, 'type', event.target.value as QuestionnaireQuestion['type'])}
                      >
                        <option value="TEXT">Resposta livre</option>
                        <option value="SINGLE">Múltipla escolha (única)</option>
                        <option value="MULTI">Múltipla escolha (várias)</option>
                        <option value="SCALE">Escala (1-5)</option>
                      </Select>
                      <Select
                        value={question.required ? 'true' : 'false'}
                        onChange={(event) => updateQuestionField(index, 'required', event.target.value === 'true')}
                      >
                        <option value="true">Resposta obrigatória</option>
                        <option value="false">Resposta opcional</option>
                      </Select>
                    </div>
                    {(question.type === 'SINGLE' || question.type === 'MULTI') && (
                      <div className="mt-3 space-y-3">
                        <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">Opções</p>
                        {(question.options ?? []).map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-3">
                            <Input
                              placeholder="Título"
                              value={option.label}
                              onChange={(event) => updateOption(index, optionIndex, 'label', event.target.value)}
                            />
                            <Input
                              placeholder="Valor"
                              value={option.value}
                              onChange={(event) => updateOption(index, optionIndex, 'value', event.target.value)}
                            />
                            <Button variant="ghost" size="sm" onClick={() => removeOption(index, optionIndex)}>
                              Remover
                            </Button>
                          </div>
                        ))}
                        <Button variant="ghost" size="sm" onClick={() => addOption(index)}>
                          Adicionar opção
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <Button variant="ghost" onClick={addQuestion}>
                  Adicionar pergunta
                </Button>
                <Button className="btn-gradient" onClick={submitQuestionnaire}>
                  {editing ? 'Salvar alterações' : 'Criar questionário'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {responding && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="rounded-3xl border border-foreground/10 bg-white/90 p-6 shadow-soft"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{responding.title}</h3>
                  <p className="text-sm text-foreground/60">
                    Compartilhe suas preferências para que possamos criar experiências memoráveis.
                  </p>
                </div>
                <Button variant="ghost" onClick={() => setResponding(null)}>
                  Fechar
                </Button>
              </div>
              <div className="space-y-4">
                {(responding.questions ?? []).map((question) => (
                  <div key={question.id} className="space-y-2">
                    <p className="text-sm font-medium text-foreground">{question.prompt}</p>
                    {question.type === 'TEXT' ? (
                      <Textarea
                        value={(answers[question.id ?? ''] as string) ?? ''}
                        onChange={(event) =>
                          setAnswers((prev) => ({ ...prev, [question.id ?? '']: event.target.value }))
                        }
                      />
                    ) : question.type === 'SCALE' ? (
                      <Select
                        value={(answers[question.id ?? ''] as string) ?? ''}
                        onChange={(event) =>
                          setAnswers((prev) => ({ ...prev, [question.id ?? '']: event.target.value }))
                        }
                      >
                        <option value="">Selecione</option>
                        {[1, 2, 3, 4, 5].map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {(question.options ?? []).map((option) => {
                          const id = question.id ?? '';
                          const value = answers[id] ?? (question.type === 'MULTI' ? [] : '');
                          if (question.type === 'SINGLE') {
                            return (
                              <label key={option.value} className="flex items-center gap-2 text-sm text-foreground/70">
                                <input
                                  type="radio"
                                  name={id}
                                  value={option.value}
                                  checked={value === option.value}
                                  onChange={() =>
                                    setAnswers((prev) => ({ ...prev, [id]: option.value }))
                                  }
                                />
                                {option.label}
                              </label>
                            );
                          }
                          const selectedValues = Array.isArray(value) ? value : [];
                          return (
                            <label key={option.value} className="flex items-center gap-2 text-sm text-foreground/70">
                              <input
                                type="checkbox"
                                name={`${id}-${option.value}`}
                                value={option.value}
                                checked={selectedValues.includes(option.value)}
                                onChange={(event) => {
                                  setAnswers((prev) => {
                                    const list = Array.isArray(prev[id]) ? [...(prev[id] as string[])] : [];
                                    if (event.target.checked) {
                                      list.push(option.value);
                                    } else {
                                      const idx = list.indexOf(option.value);
                                      if (idx >= 0) list.splice(idx, 1);
                                    }
                                    return { ...prev, [id]: list };
                                  });
                                }}
                              />
                              {option.label}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button className="btn-gradient" onClick={submitResponse}>
                  Enviar respostas
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
