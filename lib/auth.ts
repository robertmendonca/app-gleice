import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import database from './db';
import { createId, toISO } from './utils';
import type { User, UserRole } from '@/types/database';

export const SESSION_COOKIE_NAME = 'gleice_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 dias

export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

const insertSession = database.prepare(
  `INSERT INTO sessions (id, user_id, token, created_at, expires_at, user_agent, ip_address)
   VALUES (@id, @user_id, @token, @created_at, @expires_at, @user_agent, @ip_address)`
);

const deleteSessionStatement = database.prepare(`DELETE FROM sessions WHERE token = ?`);
const fetchSessionStatement = database.prepare(
  `SELECT sessions.*, users.id as user_id, users.name, users.email, users.role, users.consultant_id
     FROM sessions
     INNER JOIN users ON users.id = sessions.user_id
     WHERE sessions.token = ? AND sessions.expires_at > datetime('now')`
);

export const createSession = async (
  user: Pick<User, 'id' | 'role' | 'name' | 'email' | 'consultant_id'>
) => {
  const id = createId();
  const token = randomBytes(48).toString('base64url');
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000);

  const headerList = headers();
  const userAgent = headerList.get('user-agent');
  const ip = headerList.get('x-forwarded-for');

  insertSession.run({
    id,
    user_id: user.id,
    token,
    created_at: toISO(now),
    expires_at: toISO(expires),
    user_agent: userAgent,
    ip_address: ip
  });

  const cookieStore = cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: true,
    maxAge: SESSION_TTL_SECONDS
  });

  return token;
};

export const destroySession = (token?: string | null) => {
  const value = token ?? cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!value) return;
  deleteSessionStatement.run(value);
  const store = cookies();
  store.delete(SESSION_COOKIE_NAME);
};

export const getSessionUser = () => {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const row = fetchSessionStatement.get(token);
  if (!row) return null;
  return {
    id: row.user_id as string,
    name: row.name as string,
    email: row.email as string,
    role: row.role as UserRole,
    consultantId: (row.consultant_id as string) ?? null
  };
};

export const requireRole = (roles: UserRole[]) => {
  const session = getSessionUser();
  if (!session || !roles.includes(session.role)) {
    const response = NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }
  return session;
};
