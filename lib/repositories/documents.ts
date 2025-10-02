import database from '@/lib/db';
import { createId, toISO } from '@/lib/utils';
import type { UserRole } from '@/types/database';

const listAllStatement = database.prepare(
  `SELECT documents.*, client.name as client_name, consultant.name as consultant_name
     FROM documents
     INNER JOIN users as client ON client.id = documents.client_id
     INNER JOIN users as consultant ON consultant.id = documents.consultant_id
     ORDER BY datetime(created_at) DESC`
);

const listByConsultantStatement = database.prepare(
  `SELECT documents.*, client.name as client_name, consultant.name as consultant_name
     FROM documents
     INNER JOIN users as client ON client.id = documents.client_id
     INNER JOIN users as consultant ON consultant.id = documents.consultant_id
     WHERE documents.consultant_id = ?
     ORDER BY datetime(created_at) DESC`
);

const listByClientStatement = database.prepare(
  `SELECT documents.*, client.name as client_name, consultant.name as consultant_name
     FROM documents
     INNER JOIN users as client ON client.id = documents.client_id
     INNER JOIN users as consultant ON consultant.id = documents.consultant_id
     WHERE documents.client_id = ?
     ORDER BY datetime(created_at) DESC`
);

const insertDocumentStatement = database.prepare(
  `INSERT INTO documents (id, consultant_id, client_id, filename, original_name, mime_type, size, status, created_at)
   VALUES (@id, @consultant_id, @client_id, @filename, @original_name, @mime_type, @size, @status, @created_at)`
);

const updateStatusStatement = database.prepare(
  `UPDATE documents SET status = @status WHERE id = @id AND consultant_id = @consultant_id`
);

export const documentsRepository = {
  listForUser(userId: string, role: UserRole) {
    if (role === 'ADMIN') return listAllStatement.all();
    if (role === 'CONSULTANT') return listByConsultantStatement.all(userId);
    return listByClientStatement.all(userId);
  },

  create(data: {
    consultantId: string;
    clientId: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
  }) {
    const id = createId();
    insertDocumentStatement.run({
      id,
      consultant_id: data.consultantId,
      client_id: data.clientId,
      filename: data.filename,
      original_name: data.originalName,
      mime_type: data.mimeType,
      size: data.size,
      status: 'PENDING',
      created_at: toISO()
    });
    return id;
  },

  updateStatus(id: string, consultantId: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') {
    updateStatusStatement.run({ id, consultant_id: consultantId, status });
  }
};
