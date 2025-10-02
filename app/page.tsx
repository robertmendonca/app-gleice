import { Hero } from '@/components/marketing/hero';
import { ContactForm } from '@/components/forms/contact-form';
import { NewsletterForm } from '@/components/forms/newsletter-form';

const services = [
  {
    title: 'Diagnóstico de Estilo 360°',
    description:
      'Questionários dinâmicos, leitura corporal e análise de guarda-roupa com relatórios inteligentes para decisões assertivas.'
  },
  {
    title: 'Lookbooks Cinematográficos',
    description:
      'Composições com narrativa, moodboard de ocasiões e guias de combinações que traduzem a identidade visual da cliente.'
  },
  {
    title: 'Agenda Estratégica',
    description:
      'Gestão de consultorias, follow-ups e lembretes automatizados garantindo presença impecável em cada encontro.'
  }
];

const testimonials = [
  {
    name: 'Mariana Ribeiro',
    title: 'CEO & Empreendedora',
    quote:
      'Em cada sessão, senti que minha imagem ganhava uma narrativa poderosa. A plataforma torna o acompanhamento extremamente sofisticado.'
  },
  {
    name: 'Ana Clara',
    title: 'Consultora de Imagem',
    quote:
      'Consigo conduzir clientes high-ticket com excelência. A gestão de lookbooks e feedbacks elevou totalmente a experiência.'
  }
];

export default function HomePage() {
  return (
    <main className="space-y-20 pb-20">
      <Hero />
      <section className="container-max grid gap-10 rounded-[3rem] bg-white/80 px-8 py-12 shadow-soft md:grid-cols-3">
        {services.map((service) => (
          <div key={service.title} className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">{service.title}</h3>
            <p className="text-sm text-foreground/60">{service.description}</p>
          </div>
        ))}
      </section>
      <section className="container-max grid gap-6 rounded-[3rem] bg-[#1f1f1f] px-8 py-12 text-white md:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-4">
          <span className="text-xs uppercase tracking-[0.4em] text-white/60">Boletim de estilo</span>
          <h2 className="text-3xl font-semibold">Insights exclusivos para elevar sua presença.</h2>
          <p className="text-sm text-white/70">
            Receba tendências, curadorias e bastidores das consultorias premium da Gleice.
          </p>
        </div>
        <NewsletterForm />
      </section>
      <section className="container-max grid gap-6 md:grid-cols-2">
        {testimonials.map((testimonial) => (
          <div key={testimonial.name} className="rounded-[2.5rem] border border-foreground/10 bg-white/80 p-8 shadow-soft">
            <p className="text-lg text-foreground/80">“{testimonial.quote}”</p>
            <p className="mt-6 text-sm font-semibold text-foreground">{testimonial.name}</p>
            <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">{testimonial.title}</p>
          </div>
        ))}
      </section>
      <section id="contato" className="container-max grid gap-10 rounded-[3rem] bg-white/90 px-8 py-12 shadow-soft md:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-4">
          <span className="text-xs uppercase tracking-[0.4em] text-foreground/40">Converse com Gleice</span>
          <h2 className="text-3xl font-semibold text-foreground">Crie uma narrativa visual inesquecível</h2>
          <p className="text-sm text-foreground/60">
            Compartilhe seus objetivos e receba uma proposta personalizada para consultorias one-to-one, equipes executivas ou experiências de closet.
          </p>
          <p className="text-sm text-foreground/60">Tempo médio de resposta: 2 horas úteis.</p>
        </div>
        <ContactForm />
      </section>
    </main>
  );
}
