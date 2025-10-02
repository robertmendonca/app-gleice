export type UserRole = 'ADMIN' | 'CONSULTANT' | 'CLIENT';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: UserRole;
  consultant_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  created_at: string;
  expires_at: string;
  user_agent: string | null;
  ip_address: string | null;
}

export interface Invite {
  id: string;
  email: string;
  token: string;
  role: UserRole;
  consultant_id: string | null;
  created_by: string;
  created_at: string;
  expires_at: string;
  accepted: number;
}

export interface Questionnaire {
  id: string;
  consultant_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  questionnaire_id: string;
  prompt: string;
  type: 'SINGLE' | 'MULTI' | 'TEXT' | 'SCALE';
  required: number;
  position: number;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  label: string;
  value: string;
  position: number;
}

export interface QuestionnaireResponse {
  id: string;
  questionnaire_id: string;
  client_id: string;
  consultant_id: string;
  submitted_at: string;
}

export interface QuestionnaireAnswer {
  id: string;
  response_id: string;
  question_id: string;
  answer: string;
}

export interface Lookbook {
  id: string;
  consultant_id: string;
  client_id: string | null;
  title: string;
  description: string | null;
  tags: string | null;
  cover_image: string | null;
  created_at: string;
  updated_at: string;
}

export interface LookbookItem {
  id: string;
  lookbook_id: string;
  image_url: string;
  description: string | null;
  tags: string | null;
  position: number;
}

export interface Appointment {
  id: string;
  consultant_id: string;
  client_id: string;
  start_at: string;
  end_at: string;
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'COMPLETED';
  notes: string | null;
  created_at: string;
}

export interface DocumentRecord {
  id: string;
  consultant_id: string;
  client_id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

export interface FeedbackRecord {
  id: string;
  appointment_id: string;
  consultant_id: string;
  client_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}
