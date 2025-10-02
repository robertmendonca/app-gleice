import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const dbPath = join(process.cwd(), 'database');
if (!existsSync(dbPath)) {
  mkdirSync(dbPath, { recursive: true });
}

const database = new Database(join(dbPath, 'gleice.db'));

database.pragma('journal_mode = WAL');

database
  .prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('ADMIN','CONSULTANT','CLIENT')),
      consultant_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `)
  .run();

database
  .prepare(`
    CREATE TABLE IF NOT EXISTS invites (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL,
      consultant_id TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      accepted INTEGER DEFAULT 0
    );
  `)
  .run();

database
  .prepare(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      user_agent TEXT,
      ip_address TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `)
  .run();

database
  .prepare(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `)
  .run();

database
  .prepare(`
    CREATE TABLE IF NOT EXISTS questionnaires (
      id TEXT PRIMARY KEY,
      consultant_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(consultant_id) REFERENCES users(id)
    );
  `)
  .run();

database
  .prepare(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      questionnaire_id TEXT NOT NULL,
      prompt TEXT NOT NULL,
      type TEXT NOT NULL,
      required INTEGER DEFAULT 0,
      position INTEGER DEFAULT 0,
      FOREIGN KEY(questionnaire_id) REFERENCES questionnaires(id)
    );
  `)
  .run();

database
  .prepare(`
    CREATE TABLE IF NOT EXISTS question_options (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      position INTEGER DEFAULT 0,
      FOREIGN KEY(question_id) REFERENCES questions(id)
    );
  `)
  .run();

database
  .prepare(`
    CREATE TABLE IF NOT EXISTS questionnaire_responses (
      id TEXT PRIMARY KEY,
      questionnaire_id TEXT NOT NULL,
      client_id TEXT NOT NULL,
      consultant_id TEXT NOT NULL,
      submitted_at TEXT NOT NULL,
      FOREIGN KEY(questionnaire_id) REFERENCES questionnaires(id),
      FOREIGN KEY(client_id) REFERENCES users(id),
      FOREIGN KEY(consultant_id) REFERENCES users(id)
    );
  `)
  .run();

database
  .prepare(`
    CREATE TABLE IF NOT EXISTS questionnaire_answers (
      id TEXT PRIMARY KEY,
      response_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      answer TEXT NOT NULL,
      FOREIGN KEY(response_id) REFERENCES questionnaire_responses(id),
      FOREIGN KEY(question_id) REFERENCES questions(id)
    );
  `)
  .run();

database
  .prepare(`
    CREATE TABLE IF NOT EXISTS lookbooks (
      id TEXT PRIMARY KEY,
      consultant_id TEXT NOT NULL,
      client_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      tags TEXT,
      cover_image TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(consultant_id) REFERENCES users(id),
      FOREIGN KEY(client_id) REFERENCES users(id)
    );
  `)
  .run();

database
  .prepare(`
    CREATE TABLE IF NOT EXISTS lookbook_items (
      id TEXT PRIMARY KEY,
      lookbook_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      description TEXT,
      tags TEXT,
      position INTEGER DEFAULT 0,
      FOREIGN KEY(lookbook_id) REFERENCES lookbooks(id)
    );
  `)
  .run();

database
  .prepare(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      consultant_id TEXT NOT NULL,
      client_id TEXT NOT NULL,
      start_at TEXT NOT NULL,
      end_at TEXT NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(consultant_id) REFERENCES users(id),
      FOREIGN KEY(client_id) REFERENCES users(id)
    );
  `)
  .run();

database
  .prepare(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      consultant_id TEXT NOT NULL,
      client_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(consultant_id) REFERENCES users(id),
      FOREIGN KEY(client_id) REFERENCES users(id)
    );
  `)
  .run();

database
  .prepare(`
    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      appointment_id TEXT NOT NULL,
      consultant_id TEXT NOT NULL,
      client_id TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(appointment_id) REFERENCES appointments(id),
      FOREIGN KEY(consultant_id) REFERENCES users(id),
      FOREIGN KEY(client_id) REFERENCES users(id)
    );
  `)
  .run();

export default database;
