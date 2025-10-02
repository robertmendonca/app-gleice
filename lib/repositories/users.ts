import database from '@/lib/db';
import { createId, toISO } from '@/lib/utils';
import type { User, Invite, UserRole } from '@/types/database';

const createUserStatement = database.prepare(
  `INSERT INTO users (id, email, password_hash, name, role, consultant_id, created_at, updated_at)
   VALUES (@id, @email, @password_hash, @name, @role, @consultant_id, @created_at, @updated_at)`
);

const updateUserPasswordStatement = database.prepare(
  `UPDATE users SET password_hash = @password_hash, updated_at = @updated_at WHERE id = @id`
);

const fetchUserByEmailStatement = database.prepare(`SELECT * FROM users WHERE email = ? LIMIT 1`);
const fetchUserByIdStatement = database.prepare(`SELECT * FROM users WHERE id = ? LIMIT 1`);

const createInviteStatement = database.prepare(
  `INSERT INTO invites (id, email, token, role, consultant_id, created_by, created_at, expires_at, accepted)
   VALUES (@id, @email, @token, @role, @consultant_id, @created_by, @created_at, @expires_at, 0)`
);

const fetchInviteByTokenStatement = database.prepare(`SELECT * FROM invites WHERE token = ? LIMIT 1`);
const markInviteAcceptedStatement = database.prepare(`UPDATE invites SET accepted = 1 WHERE id = ?`);
const expireInvitesStatement = database.prepare(`DELETE FROM invites WHERE expires_at <= datetime('now') OR accepted = 1`);
const listInvitesByCreatorStatement = database.prepare(
  `SELECT * FROM invites WHERE created_by = ? ORDER BY datetime(created_at) DESC`
);
const listInvitesForConsultantStatement = database.prepare(
  `SELECT * FROM invites WHERE consultant_id = ? ORDER BY datetime(created_at) DESC`
);

const createResetStatement = database.prepare(
  `INSERT INTO password_resets (id, user_id, token, expires_at, created_at)
   VALUES (@id, @user_id, @token, @expires_at, @created_at)`
);

const fetchResetByTokenStatement = database.prepare(
  `SELECT * FROM password_resets WHERE token = ? AND expires_at > datetime('now') LIMIT 1`
);

const deleteResetByIdStatement = database.prepare(`DELETE FROM password_resets WHERE id = ?`);

export const usersRepository = {
  async create({
    email,
    password_hash,
    name,
    role,
    consultant_id
  }: Pick<User, 'email' | 'password_hash' | 'name' | 'role'> & { consultant_id?: string | null }) {
    const now = toISO();
    const id = createId();
    createUserStatement.run({
      id,
      email,
      password_hash,
      name,
      role,
      consultant_id: consultant_id ?? null,
      created_at: now,
      updated_at: now
    });
    return this.findById(id)!;
  },

  findByEmail(email: string) {
    return fetchUserByEmailStatement.get(email) as User | undefined;
  },

  findById(id: string) {
    return fetchUserByIdStatement.get(id) as User | undefined;
  },

  createInvite({ email, role, consultantId, createdBy }: { email: string; role: UserRole; consultantId?: string | null; createdBy: string }) {
    expireInvitesStatement.run();
    const id = createId();
    const token = createId() + createId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    createInviteStatement.run({
      id,
      email,
      token,
      role,
      consultant_id: consultantId ?? null,
      created_by: createdBy,
      created_at: toISO(now),
      expires_at: toISO(expiresAt)
    });
    return this.findInviteByToken(token)!;
  },

  findInviteByToken(token: string) {
    expireInvitesStatement.run();
    return fetchInviteByTokenStatement.get(token) as Invite | undefined;
  },

  markInviteAccepted(id: string) {
    markInviteAcceptedStatement.run(id);
  },

  listInvitesForUser(userId: string, role: UserRole) {
    if (role === 'ADMIN') {
      return listInvitesByCreatorStatement.all(userId) as Invite[];
    }
    return listInvitesForConsultantStatement.all(userId) as Invite[];
  },

  createPasswordReset(userId: string) {
    const id = createId();
    const token = createId() + createId();
    const now = new Date();
    const expires = new Date(now.getTime() + 60 * 60 * 1000);
    createResetStatement.run({
      id,
      user_id: userId,
      token,
      expires_at: toISO(expires),
      created_at: toISO(now)
    });
    return { id, token, expiresAt: expires.toISOString() };
  },

  findResetToken(token: string) {
    return fetchResetByTokenStatement.get(token) as
      | { id: string; user_id: string; token: string; expires_at: string; created_at: string }
      | undefined;
  },

  deleteReset(id: string) {
    deleteResetByIdStatement.run(id);
  },

  updatePassword(userId: string, passwordHash: string) {
    updateUserPasswordStatement.run({ id: userId, password_hash: passwordHash, updated_at: toISO() });
  }
};
