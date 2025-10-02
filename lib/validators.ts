import { z } from 'zod';
import { sanitize } from './utils';

const email = z
  .string({ required_error: 'Email obrigatório' })
  .email('Informe um email válido')
  .transform((value) => sanitize(value.toLowerCase().trim()));

const name = z
  .string({ required_error: 'Nome obrigatório' })
  .min(2, 'Informe pelo menos 2 caracteres')
  .max(100, 'Máximo 100 caracteres')
  .transform((value) => sanitize(value.trim()));

export const loginSchema = z.object({
  email,
  password: z
    .string({ required_error: 'Senha obrigatória' })
    .min(8, 'Senha deve ter no mínimo 8 caracteres'),
  token: z.string().min(10, 'Proteção obrigatória')
});

export const registerConsultantSchema = z
  .object({
    name,
    email,
    password: z
      .string({ required_error: 'Senha obrigatória' })
      .min(8, 'Senha deve ter no mínimo 8 caracteres'),
    confirmation: z.string({ required_error: 'Confirmação obrigatória' }),
    token: z.string().min(10, 'Proteção obrigatória')
  })
  .refine((data) => data.password === data.confirmation, {
    message: 'As senhas não coincidem',
    path: ['confirmation']
  });

export const inviteClientSchema = z.object({
  email,
  consultantId: z.string().min(1)
});

export const resetPasswordRequestSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10),
    password: z.string().min(8),
    confirmation: z.string().min(8)
  })
  .refine((data) => data.password === data.confirmation, {
    message: 'As senhas não coincidem',
    path: ['confirmation']
  });

export const acceptInviteSchema = z
  .object({
    token: z.string().min(10),
    name,
    password: z.string().min(8),
    confirmation: z.string().min(8)
  })
  .refine((data) => data.password === data.confirmation, {
    message: 'As senhas não coincidem',
    path: ['confirmation']
  });

export const questionnaireSchema = z.object({
  title: z.string().min(3).max(120).transform((value) => sanitize(value)),
  description: z.string().max(800).optional().transform((value) => (value ? sanitize(value) : undefined)),
  questions: z
    .array(
      z.object({
        id: z.string().optional(),
        prompt: z.string().min(2).transform((value) => sanitize(value)),
        type: z.enum(['SINGLE', 'MULTI', 'TEXT', 'SCALE']),
        required: z.boolean().optional().default(false),
        options: z
          .array(
            z.object({
              id: z.string().optional(),
              label: z.string().min(1).transform((value) => sanitize(value)),
              value: z.string().min(1).transform((value) => sanitize(value))
            })
          )
          .optional()
      })
    )
    .min(1, 'Adicione pelo menos uma pergunta')
});

export const lookbookSchema = z.object({
  title: z.string().min(3).max(120).transform((value) => sanitize(value)),
  description: z.string().max(600).optional().transform((value) => (value ? sanitize(value) : undefined)),
  tags: z.array(z.string().max(40).transform((value) => sanitize(value))).optional(),
  clientId: z.string().optional()
});

export const appointmentSchema = z.object({
  consultantId: z.string().min(1),
  clientId: z.string().min(1),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
  notes: z.string().max(600).optional().transform((value) => (value ? sanitize(value) : undefined))
});

export const documentSchema = z.object({
  clientId: z.string().min(1),
  consultantId: z.string().min(1)
});

export const feedbackSchema = z.object({
  appointmentId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().max(600).optional().transform((value) => (value ? sanitize(value) : undefined))
});

export const contactSchema = z.object({
  name,
  email,
  message: z.string().min(10).max(800).transform((value) => sanitize(value)),
  token: z.string().min(10, 'Proteção obrigatória')
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterConsultantInput = z.infer<typeof registerConsultantSchema>;
export type InviteClientInput = z.infer<typeof inviteClientSchema>;
export type QuestionnaireInput = z.infer<typeof questionnaireSchema>;
export type LookbookInput = z.infer<typeof lookbookSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
