import database from '@/lib/db';
import { createId, toISO } from '@/lib/utils';
import type { UserRole } from '@/types/database';

const listAllStatement = database.prepare(
  `SELECT appointments.*, consultant.name as consultant_name, client.name as client_name
     FROM appointments
     INNER JOIN users as consultant ON consultant.id = appointments.consultant_id
     INNER JOIN users as client ON client.id = appointments.client_id
     ORDER BY datetime(start_at) DESC`
);

const listByConsultantStatement = database.prepare(
  `SELECT appointments.*, consultant.name as consultant_name, client.name as client_name
     FROM appointments
     INNER JOIN users as consultant ON consultant.id = appointments.consultant_id
     INNER JOIN users as client ON client.id = appointments.client_id
     WHERE appointments.consultant_id = ?
     ORDER BY datetime(start_at) DESC`
);

const listByClientStatement = database.prepare(
  `SELECT appointments.*, consultant.name as consultant_name, client.name as client_name
     FROM appointments
     INNER JOIN users as consultant ON consultant.id = appointments.consultant_id
     INNER JOIN users as client ON client.id = appointments.client_id
     WHERE appointments.client_id = ?
     ORDER BY datetime(start_at) DESC`
);

const insertAppointmentStatement = database.prepare(
  `INSERT INTO appointments (id, consultant_id, client_id, start_at, end_at, status, notes, created_at)
   VALUES (@id, @consultant_id, @client_id, @start_at, @end_at, @status, @notes, @created_at)`
);

const updateAppointmentStatement = database.prepare(
  `UPDATE appointments SET start_at = @start_at, end_at = @end_at, status = @status, notes = @notes WHERE id = @id`
);

const deleteAppointmentStatement = database.prepare(`DELETE FROM appointments WHERE id = ?`);

export const appointmentsRepository = {
  listForUser(userId: string, role: UserRole) {
    if (role === 'ADMIN') return listAllStatement.all();
    if (role === 'CONSULTANT') return listByConsultantStatement.all(userId);
    return listByClientStatement.all(userId);
  },

  create(data: { consultantId: string; clientId: string; startAt: string; endAt: string; notes?: string }) {
    const id = createId();
    insertAppointmentStatement.run({
      id,
      consultant_id: data.consultantId,
      client_id: data.clientId,
      start_at: data.startAt,
      end_at: data.endAt,
      status: 'PENDING',
      notes: data.notes ?? null,
      created_at: toISO()
    });
    return id;
  },

  update(id: string, data: { startAt: string; endAt: string; status: string; notes?: string }) {
    updateAppointmentStatement.run({
      id,
      start_at: data.startAt,
      end_at: data.endAt,
      status: data.status,
      notes: data.notes ?? null
    });
  },

  delete(id: string) {
    deleteAppointmentStatement.run(id);
  }
};
