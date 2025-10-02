'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const Hero = () => {
  return (
    <section className="container-max flex flex-col gap-10 py-16 md:flex-row md:items-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 space-y-6"
      >
        <span className="text-xs uppercase tracking-[0.4em] text-foreground/40">Consultoria signature</span>
        <h1 className="text-4xl font-semibold leading-tight text-foreground md:text-5xl">
          Construímos narrativas visuais para mulheres que desejam presença inesquecível.
        </h1>
        <p className="text-base text-foreground/60 md:text-lg">
          A plataforma de Gleice Monteiro entrega uma jornada completa: diagnósticos personalizados, agenda inteligente e
          lookbooks exclusivos – tudo com a sofisticação que seu lifestyle exige.
        </p>
        <div className="flex flex-col gap-4 md:flex-row">
          <Button asChild className="btn-gradient">
            <Link href="/cadastro-consultor">Começar agora</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="#contato">Conversar com a equipe</Link>
          </Button>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-foreground/50">
          <span>Lookbooks cinematográficos</span>
          <span>Agenda estratégica</span>
          <span>Relatórios de evolução</span>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative flex-1"
      >
        <div className="relative h-[420px] w-full overflow-hidden rounded-[3rem] bg-[url('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center shadow-soft" />
        <div className="absolute -bottom-8 left-1/2 w-[80%] -translate-x-1/2 rounded-3xl border border-white/40 bg-white/80 px-6 py-4 text-sm backdrop-blur">
          <p className="font-semibold text-foreground">Experiência sob medida</p>
          <p className="text-foreground/60">Consultorias com dados, sensibilidade e curadoria impecável.</p>
        </div>
      </motion.div>
    </section>
  );
};
