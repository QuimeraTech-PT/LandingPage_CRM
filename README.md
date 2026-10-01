# QuimeraTech Landing Page

Site institucional público da QuimeraTech, construído com React, Vite e TanStack Start. Inclui páginas institucionais e legais, conteúdo otimizado para pesquisa e um formulário que cria novos leads na base de dados do CRM através do Supabase.

## Stack principal

- React 19
- Vite
- TanStack Router / Start
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Supabase (captura de pedidos de contacto)
- Cloudflare Workers (deploy)

## Funcionalidades

- Landing page pública com hero, sobre, especialidades, metodologia, pilares e contacto
- SEO otimizado com meta tags e schema JSON
- Formulário de contacto com validação e criação server-side de leads, organizações, contactos e oportunidades no CRM
- Consentimento de cookies e integração opcional com Google Analytics / Tag Manager

## Requisitos

- Node.js 20+
- npm

## Setup local

```powershell
git clone <url-do-repositorio>
cd landingpage
npm install
Copy-Item .env.example .env
npm run dev
```

## Variáveis de ambiente

Copie [.env.example](.env.example) para `.env` e configure os valores. A chave Supabase de service role é apenas para o servidor: não a prefixe com `VITE_`, não a exponha no cliente e configure-a como secret no Cloudflare em produção.

```env
GOOGLE_TAG_MANAGER_ID=GTM-XXXXXXX
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
SUPABASE_URL=https://<project-id>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run format
```

## Estrutura principal

```text
.
├── public/                 # assets públicos e arquivos estáticos
├── src/
│   ├── components/        # componentes do site e UI
│   ├── integrations/     # integração Supabase server-side
│   ├── lib/              # funções utilitárias, SEO e integrações
│   ├── routes/           # rotas do TanStack Router
│   ├── assets/           # imagens/logo do projeto
│   ├── styles.css        # estilos globais
│   ├── router.tsx        # configuração de rotas
│   └── start.ts          # bootstrap do app
├── .env.example          # template de variáveis de ambiente
├── components.json
├── eslint.config.js
├── package.json
├── tsconfig.json
├── vite.config.ts
├── bunfig.toml
└── README.md
```

## Deploy

A aplicação é compilada como Cloudflare Worker pelo preset Cloudflare do Nitro. Execute `npm run build` e publique o build com o Wrangler/Nitro configurado para o Worker de produção.

## Segurança

- Não commitar `.env` real ou segredos sensíveis
- Manter `SUPABASE_SERVICE_ROLE_KEY` apenas no servidor e diferente por ambiente
- Usar HTTPS em produção

## Observações

Este repositório contém o site público da QuimeraTech, não a interface interna do CRM. O formulário de contacto mantém a integração server-side com a base de dados do CRM para registar novos leads e os respetivos dados associados.
