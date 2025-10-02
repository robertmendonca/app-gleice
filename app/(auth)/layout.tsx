import { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f4f2ef] via-white to-[#f8f4ef]">
      <div className="absolute inset-x-0 top-0 -z-10 h-[320px] bg-[radial-gradient(circle_at_top,#e8dcc2,transparent)]" />
      <header className="container-max flex items-center justify-between py-6">
        <Link href="/" className="text-lg font-semibold tracking-[0.3em] uppercase text-foreground/70">
          Gleice Monteiro
        </Link>
        <nav className="hidden gap-6 text-sm text-foreground/70 md:flex">
          <Link href="/" className="hover:text-foreground">
            Voltar ao site
          </Link>
          <Link href="/cadastro-consultor" className="hover:text-foreground">
            Sou consultor(a)
          </Link>
        </nav>
      </header>
      <main className="container-max grid gap-12 py-12 lg:grid-cols-[1fr,1fr] lg:items-center">
        <section className="hidden flex-col gap-6 lg:flex">
          <p className="text-sm uppercase tracking-[0.4em] text-foreground/40">Experiência signature</p>
          <h1 className="text-4xl font-semibold leading-tight text-foreground md:text-5xl">
            Uma plataforma elegante para conduzir consultorias transformadoras
          </h1>
          <p className="text-base text-foreground/70 md:text-lg">
            Convide clientes, crie questionários de estilo, entregue lookbooks e conduza agendamentos sem perder a essência
            sofisticada da sua marca.
          </p>
          <div className="rounded-3xl border border-foreground/10 bg-white/70 p-8 shadow-soft">
            <p className="text-sm uppercase tracking-[0.3em] text-foreground/50">Segurança & privacidade</p>
            <p className="mt-3 text-lg text-foreground/80">
              Proteção com autenticação por função, convites com expiração automática e uploads criptografados.
            </p>
          </div>
        </section>
        <section className="w-full max-w-xl justify-self-center">
          <div className="rounded-3xl border border-foreground/10 bg-white/90 p-8 shadow-soft backdrop-blur">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}
