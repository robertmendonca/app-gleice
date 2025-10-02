'use client';

import { createContext, useContext } from 'react';
import type { UserRole } from '@/types/database';

export type SessionValue = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  consultantId: string | null;
};

const SessionContext = createContext<SessionValue | null>(null);

export const SessionProvider = ({ session, children }: { session: SessionValue; children: React.ReactNode }) => (
  <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession deve ser usado dentro de SessionProvider');
  }
  return context;
};
