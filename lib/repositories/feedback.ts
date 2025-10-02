import database from '@/lib/db';
import { createId, toISO } from '@/lib/utils';
import type { UserRole } from '@/types/database';

const listAllStatement = database.prepare(
  `SELECT feedback.*, consultant.name as consultant_name, client.name as client_name
     FROM feedback
     INNER JOIN users as consultant ON consultant.id = feedback.consultant_id
     INNER JOIN users as client ON client.id = feedback.client_id
     ORDER BY datetime(created_at) DESC`
);

const listByConsultantStatement = database.prepare(
  `SELECT feedback.*, consultant.name as consultant_name, client.name as client_name
     FROM feedback
     INNER JOIN users as consultant ON consultant.id = feedback.consultant_id
     INNER JOIN users as client ON client.id = feedback.client_id
     WHERE feedback.consultant_id = ?
     ORDER BY datetime(created_at) DESC`
);

const listByClientStatement = database.prepare(
  `SELECT feedback.*, consultant.name as consultant_name, client.name as client_name
     FROM feedback
     INNER JOIN users as consultant ON consultant.id = feedback.consultant_id
     INNER JOIN users as client ON client.id = feedback.client_id
     WHERE feedback.client_id = ?
     ORDER BY datetime(created_at) DESC`
);

const insertFeedbackStatement = database.prepare(
  `INSERT INTO feedback (id, appointment_id, consultant_id, client_id, rating, comment, created_at)
   VALUES (@id, @appointment_id, @consultant_id, @client_id, @rating, @comment, @created_at)`
);

export const feedbackRepository = {
  listForUser(userId: string, role: UserRole) {
    if (role === 'ADMIN') return listAllStatement.all();
    if (role === 'CONSULTANT') return listByConsultantStatement.all(userId);
    return listByClientStatement.all(userId);
  },

  create(data: { appointmentId: string; consultantId: string; clientId: string; rating: number; comment?: string }) {
    const id = createId();
    insertFeedbackStatement.run({
      id,
      appointment_id: data.appointmentId,
      consultant_id: data.consultantId,
      client_id: data.clientId,
      rating: data.rating,
      comment: data.comment ?? null,
      created_at: toISO()
    });
    return id;
  }
};
