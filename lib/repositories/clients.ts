import database from '@/lib/db';
import type { User } from '@/types/database';

const listAllClientsStatement = database.prepare(
  `SELECT * FROM users WHERE role = 'CLIENT' ORDER BY datetime(created_at) DESC`
);

const listClientsByConsultantStatement = database.prepare(
  `SELECT * FROM users WHERE role = 'CLIENT' AND consultant_id = ? ORDER BY datetime(created_at) DESC`
);

const listConsultantsStatement = database.prepare(
  `SELECT * FROM users WHERE role = 'CONSULTANT' ORDER BY datetime(created_at) DESC`
);

export const clientsRepository = {
  listClients(userId: string, role: string) {
    if (role === 'ADMIN') {
      return listAllClientsStatement.all() as User[];
    }
    if (role === 'CONSULTANT') {
      return listClientsByConsultantStatement.all(userId) as User[];
    }
    return [];
  },
  listConsultants() {
    return listConsultantsStatement.all() as User[];
  }
};
