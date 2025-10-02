import { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { SessionProvider } from '@/components/providers/session-provider';
import { LogoutButton } from '@/components/navigation/logout-button';
import { cn } from '@/lib/cn';
import { headers } from 'next/headers';

const navigation = [
  { href: '/dashboard', label: 'Visão geral', roles: ['ADMIN', 'CONSULTANT', 'CLIENT'] },
  { href: '/clientes', label: 'Clientes', roles: ['ADMIN', 'CONSULTANT'] },
  { href: '/questionarios', label: 'Questionários', roles: ['ADMIN', 'CONSULTANT'] },
  { href: '/lookbooks', label: 'Lookbooks', roles: ['ADMIN', 'CONSULTANT', 'CLIENT'] },
  { href: '/agendamentos', label: 'Agendamentos', roles: ['ADMIN', 'CONSULTANT', 'CLIENT'] },
  { href: '/documentos', label: 'Documentos', roles: ['ADMIN', 'CONSULTANT', 'CLIENT'] },
  { href: '/feedback', label: 'Feedbacks', roles: ['ADMIN', 'CONSULTANT'] }
] as const;

export default function AppLayout({ children }: { children: ReactNode }) {
  const session = getSessionUser();
  if (!session) {
    redirect('/login');
  }

  const headerList = headers();
  const pathname =
    headerList.get('next-url') ??
    headerList.get('x-invoke-path') ??
    headerList.get('x-matched-path') ??
    '/dashboard';

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-[#f7f5f2]">
        <div className="grid min-h-screen gap-0 lg:grid-cols-[260px,1fr]">
          <aside className="hidden border-r border-foreground/10 bg-white/80 px-8 py-10 lg:flex lg:flex-col lg:gap-8">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.5em] text-foreground/40">Gleice Monteiro</p>
              <h2 className="text-2xl font-semibold text-foreground">Painel Signature</h2>
            </div>
            <nav className="flex flex-col gap-2 text-sm">
              {navigation
                .filter((item) => item.roles.includes(session.role))
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'rounded-2xl px-4 py-3 font-medium transition hover:bg-primary/5',
                      pathname.startsWith(item.href) ? 'bg-primary text-white shadow-soft' : 'text-foreground/70'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
            </nav>
            <div className="mt-auto space-y-2 rounded-3xl border border-foreground/10 bg-gradient-to-br from-white to-[#f3efe7] p-6">
              <p className="text-sm font-semibold text-foreground">{session.name}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">{session.role}</p>
            </div>
          </aside>
          <main className="flex flex-col">
            <header className="flex items-center justify-between border-b border-foreground/10 bg-white/70 px-6 py-4 backdrop-blur">
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-[0.4em] text-foreground/40">Gleice Monteiro</span>
                <span className="text-sm text-foreground/60">Experiência personalizada para clientes premium</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden text-right md:block">
                  <p className="text-sm font-medium text-foreground">{session.name}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">{session.role}</p>
                </div>
                <LogoutButton />
              </div>
            </header>
            <div className="flex-1 px-4 py-6 md:px-8 md:py-10">
              <div className="mx-auto max-w-6xl space-y-8">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
