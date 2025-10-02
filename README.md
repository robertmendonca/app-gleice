# Gleice Monteiro – Plataforma Signature de Consultoria de Imagem

Aplicação Next.js com TypeScript e Tailwind CSS construída para gerenciar consultorias de imagem premium. O projeto inclui autenticação com convites, dashboards inteligentes, questionários de estilo, lookbooks, agendamentos, gestão de documentos e feedbacks.

## Como executar

```bash
npm install
npm run dev
```

As principais variáveis de ambiente:

```
AUTH_SECRET=chave-aleatoria
NEXT_PUBLIC_APP_URL=http://localhost:3000
TURNSTILE_SECRET_KEY=chave-turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=sitekey-turnstile
CONTACT_EMAIL=destino@dominio.com
SMTP_API_URL=https://api.exemplo.com/email
SMTP_API_TOKEN=token-opcional
```

A base de dados SQLite é criada automaticamente em `database/gleice.db`.

## Recursos

- Segurança com CSP, cookies HTTPOnly e validação de entrada (Zod + sanitização)
- API Routes separadas por domínio de negócio
- Upload seguro (lookbooks, documentos) com armazenamento local isolado
- Interfaces animadas com Framer Motion e componentes inspirados no shadcn/ui
- SEO otimizado via `next-seo`, PWA (manifest + service worker) e JSON-LD
- Formulários protegidos por Cloudflare Turnstile

Consulte o código nos diretórios `app/`, `components/`, `lib/` e `app/api/` para detalhes de cada módulo.
