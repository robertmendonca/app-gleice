# Gleice Monteiro – Plataforma Signature de Consultoria de Imagem

Aplicação Next.js com TypeScript e Tailwind CSS construída para gerenciar consultorias de imagem premium. O projeto inclui autenticação com convites, dashboards inteligentes, questionários de estilo, lookbooks, agendamentos, gestão de documentos e feedbacks.

## Como executar

```bash
npm install
npm run dev
```

> **Nota sobre lint**: os pacotes do ecossistema `@typescript-eslint` necessários para o parser TypeScript do ESLint estão vendorizados em `vendor/@typescript-eslint`. Eles são consumidos através de dependências `file:` declaradas no `package.json`, garantindo instalações reproduzíveis mesmo em ambientes que bloqueiam o registro npm para escopos privados. Basta executar `npm install` normalmente.

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
